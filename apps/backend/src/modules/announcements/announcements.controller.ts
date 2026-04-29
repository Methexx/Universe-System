import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import { createAnnouncementSchema, getAnnouncementsSchema } from './announcements.schema';
import { delCacheByPattern, getOrSetCache } from '../../common/utils/cache';
import { sendMulticastFcmNotification } from '../../config/firebase';

export const createAnnouncement = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = createAnnouncementSchema.parse(request.body);
    const user = (request as any).user;

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        image_url: data.image_url,
        scope: data.scope,
        target: data.target,
        class_id: data.class_id,
        author_id: user.userId
      }
    });

    await delCacheByPattern('announcements:*');

    // Trigger Firebase Push Notifications (FCM) based on scope/target
    try {
      const tokens: string[] = [];

      if (data.scope === 'school_wide') {
        if (data.target === 'all' || data.target === 'students') {
          const students = await prisma.student.findMany({
            select: { fcm_token: true },
            where: { fcm_token: { not: null } }
          });
          tokens.push(...students.map(s => s.fcm_token).filter(Boolean) as string[]);
        }
        if (data.target === 'all' || data.target === 'parents_only') {
          const parents = await prisma.user.findMany({
            select: { fcm_token: true },
            where: { role: 'parent', fcm_token: { not: null } }
          });
          tokens.push(...parents.map(p => p.fcm_token).filter(Boolean) as string[]);
        }
        if (data.target === 'all' || data.target === 'teachers') {
          const teachers = await prisma.user.findMany({
            select: { fcm_token: true },
            where: { role: 'teacher', fcm_token: { not: null } }
          });
          tokens.push(...teachers.map(t => t.fcm_token).filter(Boolean) as string[]);
        }
      }

      if (tokens.length > 0) {
        await sendMulticastFcmNotification(
          tokens,
          announcement.title,
          announcement.content,
          {
            announcementId: announcement.id,
            scope: announcement.scope,
            target: announcement.target
          }
        );
      }
    } catch (fcmError) {
      console.error('FCM notification failed (non-blocking):', fcmError);
    }

    return reply.status(201).send({
      success: true,
      message: 'Announcement published successfully',
      data: announcement
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    console.error("ANNOUNCEMENT CREATE ERROR:", error);
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to publish announcement.' });
  }
};

export const getAnnouncements = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = getAnnouncementsSchema.parse(request.query);
    const user = (request as any).user;

    const skip = (query.page - 1) * query.limit;

    // Base filters
    const whereClause: any = {};

    // For parents or users, ensure they can only see global or specific class
    if (query.scope) {
      whereClause.scope = query.scope;
    }
    if (query.class_id) {
      whereClause.class_id = query.class_id;
    }

    const cacheKey = `announcements:${user.userId}:${query.scope ?? 'all'}:${query.class_id ?? 'all'}:${query.page}:${query.limit}`;
    const cachedPayload = await getOrSetCache(cacheKey, async () => {
      const announcements = await prisma.announcement.findMany({
        where: whereClause,
        include: {
          author: {
            select: { full_name: true, role: true, avatar_url: true }
          },
          class: {
            select: { name: true, subject: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: query.limit
      });

      const total = await prisma.announcement.count({ where: whereClause });
      return {
        announcements,
        total,
      };
    });

    return reply.status(200).send({
      success: true,
      data: cachedPayload.announcements,
      meta: {
        total: cachedPayload.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(cachedPayload.total / query.limit)
      }
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to fetch announcements.' });
  }
};

export const deleteAnnouncement = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    const existing = await prisma.announcement.findUnique({ where: { id } });
    
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Announcement not found' });
    }

    // Only admin or the original author can delete
    if (user.role !== 'admin' && existing.author_id !== user.userId) {
      return reply.status(403).send({ success: false, message: 'Forbidden: You cannot delete this announcement' });
    }

    await prisma.announcement.delete({ where: { id } });
    await delCacheByPattern('announcements:*');

    return reply.status(200).send({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'Failed to delete announcement.' });
  }
};