import { FastifyInstance } from 'fastify';
import { authenticate } from '../../common/middleware/authenticate';
import { NotificationsController } from './notifications.controller';

/**
 * In-app notification centre. Every authenticated user manages their own
 * notifications — no role restriction beyond authentication.
 */
export default async function notificationRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', NotificationsController.list);
  fastify.get('/unread-count', NotificationsController.unreadCount);
  fastify.patch<{ Params: { id: string } }>('/:id/read', NotificationsController.markRead);
  fastify.post('/read-all', NotificationsController.markAllRead);
}
