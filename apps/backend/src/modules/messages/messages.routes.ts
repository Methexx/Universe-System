import { FastifyInstance } from 'fastify';
import { getInbox, getThread, sendMessage, markAsRead, generateAiDraft } from './messages.controller';
import { authenticate } from '../../common/middleware/authenticate';

export default async function messageRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/inbox', getInbox);
  fastify.get('/thread/:userId', getThread);
  fastify.post('/send', sendMessage);
  fastify.put('/:id/read', markAsRead);
  fastify.post('/ai-draft', generateAiDraft);
}