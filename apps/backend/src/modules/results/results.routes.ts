import { FastifyInstance } from 'fastify';
import { ResultsController } from './results.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/rbac';
import {
  createTermSchema,
  updateTermSchema,
  saveResultSetSchema,
  CreateTermInput,
  UpdateTermInput,
  SaveResultSetInput,
} from './results.schema';

export default async function resultsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // ── Terms ──────────────────────────────────────────────────────────────────

  // GET /api/results/terms
  fastify.get('/terms', {
    preHandler: [authorize(['teacher', 'admin'])],
  }, ResultsController.getTerms);

  // POST /api/results/terms
  fastify.post<{ Body: CreateTermInput }>('/terms', {
    preHandler: [authorize(['teacher', 'admin']), async (request) => { createTermSchema.parse(request.body); }],
  }, ResultsController.createTerm);

  // PATCH /api/results/terms/:termId
  fastify.patch<{ Params: { termId: string }; Body: UpdateTermInput }>('/terms/:termId', {
    preHandler: [authorize(['teacher', 'admin']), async (request) => { updateTermSchema.parse(request.body); }],
  }, ResultsController.renameTerm);

  // DELETE /api/results/terms/:termId
  fastify.delete<{ Params: { termId: string } }>('/terms/:termId', {
    preHandler: [authorize(['teacher', 'admin'])],
  }, ResultsController.deleteTerm);

  // ── Result sets ────────────────────────────────────────────────────────────

  // GET /api/results/class/:classId?term_id=... (get or auto-create result set)
  fastify.get<{ Params: { classId: string }; Querystring: { term_id: string } }>('/class/:classId', {
    preHandler: [authorize(['teacher', 'admin'])],
  }, ResultsController.getOrCreateResultSet);

  // PATCH /api/results/:resultSetId — save modules + grades
  fastify.patch<{ Params: { resultSetId: string }; Body: SaveResultSetInput }>('/:resultSetId', {
    preHandler: [authorize(['teacher']), async (request) => { saveResultSetSchema.parse(request.body); }],
  }, ResultsController.saveResultSet);

  // POST /api/results/:resultSetId/publish
  fastify.post<{ Params: { resultSetId: string } }>('/:resultSetId/publish', {
    preHandler: [authorize(['teacher'])],
  }, ResultsController.publishResultSet);

  // POST /api/results/:resultSetId/unpublish
  fastify.post<{ Params: { resultSetId: string } }>('/:resultSetId/unpublish', {
    preHandler: [authorize(['teacher'])],
  }, ResultsController.unpublishResultSet);
}
