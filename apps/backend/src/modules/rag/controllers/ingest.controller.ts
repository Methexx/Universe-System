import type { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { prisma } from '../../../config/prisma';
import { supabaseAdmin } from '../../../config/supabase';
import { chunkPdf, chunkText } from '../services/chunker.service';
import { embedChunks } from '../services/embedder.service';

// In-memory concurrency lock: prevents two large PDFs processing simultaneously
const processingJobs = new Set<string>();

/**
 * POST /api/rag/documents
 * Accepts a multipart PDF upload, stores it, chunks + embeds it, and saves vectors to Supabase.
 * Admin-only — enforced in rag.routes.ts via RBAC middleware.
 */
export async function ingestDocument(request: FastifyRequest, reply: FastifyReply) {
  const data = await request.file();
  if (!data) {
    return reply.status(400).send({ error: 'No file uploaded' });
  }

  const { filename, mimetype } = data;
  const buffer = await data.toBuffer();

  // Reject non-PDF/text files early
  const isPdf = mimetype === 'application/pdf' || filename.endsWith('.pdf');
  const isText = mimetype === 'text/plain' || filename.endsWith('.txt');
  if (!isPdf && !isText) {
    return reply.status(400).send({ error: 'Only PDF and plain text files are supported' });
  }

  // Duplicate detection — SHA256 of file content
  const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
  const existing = await prisma.policyDocument.findUnique({ where: { file_hash: fileHash } });
  if (existing) {
    return reply.status(409).send({
      error: 'This file has already been uploaded',
      existing_document: { id: existing.id, display_name: existing.display_name },
    });
  }

  // Concurrency guard: max 2 simultaneous ingestion jobs
  if (processingJobs.size >= 2) {
    return reply.status(429).send({
      error: 'Another document is being processed. Please wait and try again.',
    });
  }

  const user = (request as any).user;
  const userId = user.userId ?? user.id;
  const displayName = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  const storagePath = `policy-documents/${Date.now()}-${filename}`;

  // Upload original file to Supabase Storage
  const { error: storageError } = await supabaseAdmin.storage
    .from('policy-documents')
    .upload(storagePath, buffer, { contentType: mimetype, upsert: false });

  if (storageError) {
    return reply.status(500).send({ error: `Storage upload failed: ${storageError.message}` });
  }

  // Create DB record as unprocessed first so admin sees it immediately
  const doc = await prisma.policyDocument.create({
    data: {
      uploader: { connect: { id: userId } },
      file_name: filename,
      display_name: displayName,
      storage_path: storagePath,
      file_hash: fileHash,
      is_processed: false,
    },
  });

  processingJobs.add(doc.id);

  // Run ingestion pipeline asynchronously — reply immediately so admin UI isn't blocked
  reply.status(202).send({ id: doc.id, display_name: displayName, is_processed: false });

  try {
    const chunks = isPdf ? await chunkPdf(buffer) : await chunkText(buffer);
    const embeddedChunks = await embedChunks(chunks);

    // Insert chunks with embeddings using raw Supabase client
    // (Prisma cannot handle Unsupported vector type in create calls)
    const rows = embeddedChunks.map((c) => ({
      document_id: doc.id,
      chunk_text: c.text,
      chunk_index: c.index,
      embedding: `[${c.embedding.join(',')}]`,
    }));

    const { error: insertError } = await supabaseAdmin
      .from('document_chunks')
      .insert(rows);

    if (insertError) throw new Error(insertError.message);

    await prisma.policyDocument.update({
      where: { id: doc.id },
      data: { is_processed: true, chunk_count: chunks.length },
    });
  } catch (err) {
    // Mark as failed so admin knows processing didn't complete
    await prisma.policyDocument.update({
      where: { id: doc.id },
      data: { is_processed: false },
    });
    request.log.error({ err }, 'Ingestion pipeline failed for document ' + doc.id);
  } finally {
    processingJobs.delete(doc.id);
  }
}
