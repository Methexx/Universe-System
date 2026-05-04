import type { FastifyRequest, FastifyReply } from 'fastify';
import { getEvalReport } from '../services/eval.service';

/**
 * GET /api/rag/eval/report
 * Returns aggregated evaluation metrics for academic documentation.
 * Admin only.
 */
export async function evalReport(_request: FastifyRequest, reply: FastifyReply) {
  const report = await getEvalReport();
  return reply.send(report);
}
