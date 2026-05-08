import { FastifyInstance } from 'fastify';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/rbac';
import { ingestDocument, retryDocument } from './controllers/ingest.controller';
import { queryRag } from './controllers/query.controller';
import { listDocuments, deleteDocument } from './controllers/documents.controller';
import { evalReport } from './controllers/eval.controller';
import { querySchema, type QueryInput } from './rag.schema';

export default async function ragRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // ── Document management (admin only) ─────────────────────────────────────────

  fastify.post('/documents', {
    preHandler: [authorize(['admin'])],
  }, ingestDocument);

  fastify.get('/documents', {
    preHandler: [authorize(['admin'])],
  }, listDocuments);

  fastify.delete<{ Params: { id: string } }>('/documents/:id', {
    preHandler: [authorize(['admin'])],
  }, deleteDocument);

  fastify.post<{ Params: { id: string } }>('/documents/:id/retry', {
    preHandler: [authorize(['admin'])],
  }, retryDocument);

  // ── RAG query (all authenticated users: parent, teacher, admin) ──────────────
  // Per-route rate limit: stricter than global 100/min to protect LLM API costs

  fastify.post<{ Body: QueryInput }>('/query', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    preHandler: [
      authorize(['admin', 'teacher', 'parent']),
      async (request) => { querySchema.parse(request.body); },
    ],
  }, queryRag);

  // ── Evaluation report (admin only) ───────────────────────────────────────────

  fastify.get('/eval/report', {
    preHandler: [authorize(['admin'])],
  }, evalReport);
}
