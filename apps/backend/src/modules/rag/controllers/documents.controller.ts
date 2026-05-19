import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../../config/prisma';
import { supabaseAdmin } from '../../../config/supabase';

/**
 * GET /api/rag/documents
 * Returns all policy documents with processing status. Admin only.
 */
export async function listDocuments(_request: FastifyRequest, reply: FastifyReply) {
  const docs = await prisma.policyDocument.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      file_name: true,
      display_name: true,
      status: true,
      error_message: true,
      chunk_count: true,
      created_at: true,
    },
  });

  return reply.send({ documents: docs });
}

/**
 * DELETE /api/rag/documents/:id
 * Deletes document record (cascades to document_chunks via FK) and removes from Storage.
 * Admin only.
 */
export async function deleteDocument(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const doc = await prisma.policyDocument.findUnique({ where: { id } });
  if (!doc) {
    return reply.status(404).send({ error: 'Document not found' });
  }

  // Remove original file from Supabase Storage
  await supabaseAdmin.storage.from('policy-documents').remove([doc.storage_path]);

  // Delete DB record — document_chunks cascade on delete
  await prisma.policyDocument.delete({ where: { id } });

  return reply.send({ success: true });
}
