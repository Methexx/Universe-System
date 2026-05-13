import { FastifyRequest, FastifyReply } from 'fastify';
import { ResultsService } from './results.service';
import {
  CreateTermInput,
  UpdateTermInput,
  SaveResultSetInput,
} from './results.schema';
import { successResponse, errorResponse } from '../../common/utils/response';
import { delCacheByPattern, getOrSetCache } from '../../common/utils/cache';

export class ResultsController {

  // ── Terms ──────────────────────────────────────────────────────────────────

  static async getTerms(_request: FastifyRequest, reply: FastifyReply) {
    const data = await getOrSetCache('results:terms', () => ResultsService.getTerms(), 60);
    return reply.send(successResponse('Terms fetched', data));
  }

  static async createTerm(
    request: FastifyRequest<{ Body: CreateTermInput }>,
    reply: FastifyReply
  ) {
    try {
      const teacherId = (request as any).user.userId;
      const data = await ResultsService.createTerm(request.body, teacherId);
      await delCacheByPattern('results:*');
      return reply.status(201).send(successResponse('Term created', data));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async renameTerm(
    request: FastifyRequest<{ Params: { termId: string }; Body: UpdateTermInput }>,
    reply: FastifyReply
  ) {
    try {
      const teacherId = (request as any).user.userId;
      const data = await ResultsService.renameTerm(request.params.termId, request.body, teacherId);
      await delCacheByPattern('results:*');
      return reply.send(successResponse('Term renamed', data));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async deleteTerm(
    request: FastifyRequest<{ Params: { termId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const teacherId = (request as any).user.userId;
      await ResultsService.deleteTerm(request.params.termId, teacherId);
      await delCacheByPattern('results:*');
      return reply.send(successResponse('Term deleted', null));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  // ── Result sets ────────────────────────────────────────────────────────────

  static async getOrCreateResultSet(
    request: FastifyRequest<{ Params: { classId: string }; Querystring: { term_id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const teacherId = (request as any).user.userId;
      const { term_id } = request.query;
      if (!term_id) return reply.status(400).send(errorResponse('term_id query param required'));
      const data = await ResultsService.getOrCreateResultSet(request.params.classId, term_id, teacherId);
      await delCacheByPattern('results:*');
      return reply.send(successResponse('Result set fetched', data));
    } catch (error: any) {
      return reply.status(403).send(errorResponse(error.message));
    }
  }

  static async saveResultSet(
    request: FastifyRequest<{ Params: { resultSetId: string }; Body: SaveResultSetInput }>,
    reply: FastifyReply
  ) {
    try {
      const teacherId = (request as any).user.userId;
      const data = await ResultsService.saveResultSet(request.params.resultSetId, teacherId, request.body);
      await delCacheByPattern('results:*');
      return reply.send(successResponse('Result set saved', data));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async publishResultSet(
    request: FastifyRequest<{ Params: { resultSetId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const teacherId = (request as any).user.userId;
      const data = await ResultsService.publishResultSet(request.params.resultSetId, teacherId);
      await delCacheByPattern('results:*');
      return reply.send(successResponse('Result set published', data));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async unpublishResultSet(
    request: FastifyRequest<{ Params: { resultSetId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const teacherId = (request as any).user.userId;
      const data = await ResultsService.unpublishResultSet(request.params.resultSetId, teacherId);
      await delCacheByPattern('results:*');
      return reply.send(successResponse('Result set unpublished', data));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }
}
