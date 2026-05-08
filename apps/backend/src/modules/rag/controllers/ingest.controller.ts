import type { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { prisma } from '../../../config/prisma';
import { supabaseAdmin } from '../../../config/supabase';
import { chunkPdf, chunkText } from '../services/chunker.service';
import { embedChunks } from '../services/embedder.service';

const PIPELINE_TIMEOUT_MS = 10 * 60 * 1000;

// In-memory concurrency lock — source of truth is DB processing_status
const processingJobs = new Set<string>();

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms)
    ),
  ]);
}

async function runIngestionPipeline(
  docId: string,
  buffer: Buffer,
  isPdf: boolean,
  log: FastifyRequest['log']
): Promise<void> {
  await prisma.policyDocument.update({
    where: { id: docId },
    data: { processing_status: 'processing', processing_error: null },
  });

  try {
    await withTimeout(
      (async () => {
        const chunks = isPdf ? await chunkPdf(buffer) : await chunkText(buffer);
        const embeddedChunks = await embedChunks(chunks);

        // Delete any previously inserted chunks (relevant on retry)
        await prisma.$executeRaw`DELETE FROM document_chunks WHERE document_id = ${docId}::uuid`;

        if (embeddedChunks.length > 0) {
          const valuePlaceholders = embeddedChunks
            .map((_, i) => {
              const base = i * 4;
              return `($${base + 1}::uuid, $${base + 2}, $${base + 3}::int, $${base + 4}::vector)`;
            })
            .join(', ');
          const params: (string | number)[] = [];
          for (const c of embeddedChunks) {
            params.push(docId, c.text, c.index, `[${c.embedding.join(',')}]`);
          }
          await prisma.$executeRawUnsafe(
            `INSERT INTO document_chunks (document_id, chunk_text, chunk_index, embedding) VALUES ${valuePlaceholders}`,
            ...params
          );
        }

        await prisma.policyDocument.update({
          where: { id: docId },
          data: {
            is_processed: true,
            processing_status: 'completed',
            processing_error: null,
            chunk_count: chunks.length,
          },
        });
      })(),
      PIPELINE_TIMEOUT_MS,
      'ingestion pipeline'
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.policyDocument.update({
      where: { id: docId },
      data: {
        is_processed: false,
        processing_status: 'failed',
        processing_error: message.slice(0, 1000),
      },
    });
    log.error({ err, docId }, 'Ingestion pipeline failed for document ' + docId);
  } finally {
    processingJobs.delete(docId);
  }
}

/**
 * POST /api/rag/documents
 * Admin-only. Accepts PDF/TXT, stores to Supabase Storage, kicks off async pipeline.
 */
export async function ingestDocument(request: FastifyRequest, reply: FastifyReply) {
  const data = await request.file();
  if (!data) return reply.status(400).send({ error: 'No file uploaded' });

  const { filename, mimetype } = data;
  const buffer = await data.toBuffer();

  const isPdf = mimetype === 'application/pdf' || filename.endsWith('.pdf');
  const isText = mimetype === 'text/plain' || filename.endsWith('.txt');
  if (!isPdf && !isText) {
    return reply.status(400).send({ error: 'Only PDF and plain text files are supported' });
  }

  const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
  const existing = await prisma.policyDocument.findUnique({ where: { file_hash: fileHash } });
  if (existing) {
    return reply.status(409).send({
      error: 'This file has already been uploaded',
      existing_document: { id: existing.id, display_name: existing.display_name },
    });
  }

  if (processingJobs.size >= 2) {
    return reply.status(429).send({
      error: 'Another document is being processed. Please wait and try again.',
    });
  }

  const user = (request as any).user;
  const userId = user.userId ?? user.id;
  const displayName = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  const storagePath = `policy-documents/${Date.now()}-${filename}`;

  const { error: storageError } = await supabaseAdmin.storage
    .from('policy-documents')
    .upload(storagePath, buffer, { contentType: mimetype, upsert: false });

  if (storageError) {
    return reply.status(500).send({ error: `Storage upload failed: ${storageError.message}` });
  }

  const doc = await prisma.policyDocument.create({
    data: {
      uploader: { connect: { id: userId } },
      file_name: filename,
      display_name: displayName,
      storage_path: storagePath,
      file_hash: fileHash,
      is_processed: false,
      processing_status: 'pending',
    },
  });

  processingJobs.add(doc.id);

  reply.status(202).send({
    id: doc.id,
    display_name: displayName,
    is_processed: false,
    processing_status: 'pending',
  });

  runIngestionPipeline(doc.id, buffer, isPdf, request.log);
}

/**
 * POST /api/rag/documents/:id/retry
 * Admin-only. Re-runs the ingestion pipeline for a document in 'failed' or 'pending' state.
 */
export async function retryDocument(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const doc = await prisma.policyDocument.findUnique({ where: { id } });
  if (!doc) return reply.status(404).send({ error: 'Document not found' });

  if (doc.processing_status === 'processing') {
    return reply.status(409).send({ error: 'Document is already being processed' });
  }

  if (doc.processing_status === 'completed') {
    return reply.status(409).send({ error: 'Document is already processed successfully' });
  }

  if (processingJobs.has(id)) {
    return reply.status(409).send({ error: 'Document is already queued for retry' });
  }

  if (processingJobs.size >= 2) {
    return reply.status(429).send({
      error: 'Processing queue is full. Please wait and try again.',
    });
  }

  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from('policy-documents')
    .download(doc.storage_path);

  if (downloadError || !fileData) {
    return reply.status(500).send({
      error: 'Could not retrieve original file: ' + (downloadError?.message ?? 'unknown'),
    });
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const isPdf = doc.file_name.endsWith('.pdf');

  processingJobs.add(id);

  reply.status(202).send({ id, processing_status: 'processing' });

  runIngestionPipeline(id, buffer, isPdf, request.log);
}
