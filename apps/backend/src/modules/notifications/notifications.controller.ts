import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';

export class NotificationsController {
  // GET /api/notifications?limit=30&before=<ISO date>
  static async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user as { userId: string };
      const { limit = '30', before } = request.query as { limit?: string; before?: string };
      const take = Math.min(100, Math.max(1, parseInt(limit) || 30));

      const where: any = { recipient_id: user.userId };
      if (before) {
        const beforeDate = new Date(before);
        if (!isNaN(beforeDate.getTime())) where.created_at = { lt: beforeDate };
      }

      const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { created_at: 'desc' },
          take,
        }),
        prisma.notification.count({
          where: { recipient_id: user.userId, is_read: false },
        }),
      ]);

      return reply.status(200).send({
        success: true,
        data: { notifications, unread_count: unreadCount },
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Failed to fetch notifications' });
    }
  }

  // GET /api/notifications/unread-count
  static async unreadCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user as { userId: string };
      const count = await prisma.notification.count({
        where: { recipient_id: user.userId, is_read: false },
      });
      return reply.status(200).send({ success: true, data: { count } });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Failed to fetch unread count' });
    }
  }

  // PATCH /api/notifications/:id/read
  static async markRead(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = (request as any).user as { userId: string };
      const { id } = request.params;

      // updateMany scoped to recipient_id so a user can only mark their own
      const result = await prisma.notification.updateMany({
        where: { id, recipient_id: user.userId },
        data: { is_read: true },
      });

      if (result.count === 0) {
        return reply.status(404).send({ success: false, message: 'Notification not found' });
      }
      return reply.status(200).send({ success: true });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Failed to update notification' });
    }
  }

  // POST /api/notifications/read-all
  static async markAllRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user as { userId: string };
      await prisma.notification.updateMany({
        where: { recipient_id: user.userId, is_read: false },
        data: { is_read: true },
      });
      return reply.status(200).send({ success: true });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Failed to update notifications' });
    }
  }
}
