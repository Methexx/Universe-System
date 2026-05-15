import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { UsersService } from './users.service';
import { updateSettingsSchema } from './settings.schema';

const updateFcmTokenSchema = z.object({
  fcm_token: z.string().min(1),
});

export const UsersController = {
  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        avatar_url: true,
        phone_number: true,
        created_at: true,
      }
    });
    return reply.status(200).send({ success: true, data: userRecord });
  },

  async updateMe(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: request.body as any,
    });
    return reply.status(200).send({ success: true, data: updated });
  },

  async deleteMe(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    await prisma.user.update({
      where: { id: user.userId },
      data: { is_active: false },
    });
    return reply.status(200).send({ success: true, message: 'Account deactivated' });
  },

  async getPending(_request: FastifyRequest, reply: FastifyReply) {
    const users = await UsersService.getPendingUsers();
    return reply.status(200).send({ success: true, data: users });
  },

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const users = await prisma.user.findMany({
      where: { role: { not: 'pending' } },
      select: { id: true, email: true, full_name: true, role: true, is_active: true, is_suspended: true, avatar_url: true, created_at: true },
    });
    return reply.status(200).send({ success: true, data: users });
  },

  async promote(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { role } = request.body as { role: string };
    const promoted = await UsersService.promoteUser(id, role);
    return reply.status(200).send({ success: true, data: promoted });
  },

  async suspend(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const suspended = await prisma.user.update({
      where: { id },
      data: { is_suspended: true },
    });
    return reply.status(200).send({ success: true, data: suspended });
  },

  async unsuspend(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const unsuspended = await prisma.user.update({
      where: { id },
      data: { is_suspended: false },
    });
    return reply.status(200).send({ success: true, data: unsuspended });
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await prisma.user.delete({ where: { id } });
    return reply.status(200).send({ success: true, message: 'User deleted' });
  },

  async getTeachers(request: FastifyRequest, reply: FastifyReply) {
    const teachers = await UsersService.getTeachers();
    return reply.status(200).send({ success: true, data: teachers });
  },

  async updateFcmToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const body = updateFcmTokenSchema.parse(request.body);

      await prisma.user.update({
        where: { id: user.userId },
        data: { fcm_token: body.fcm_token },
      });

      return reply.status(200).send({
        success: true,
        message: 'FCM token updated',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ success: false, message: 'Invalid input' });
      }
      request.log.error(error);
      reply.status(500).send({ success: false, message: 'Failed to update FCM token' });
    }
  },

  async getSettings(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    let settings = await (prisma as any).userSettings.findUnique({
      where: { userId: user.userId },
    });

    if (!settings) {
      settings = await (prisma as any).userSettings.create({
        data: { userId: user.userId },
      });
    }

    return reply.status(200).send({ success: true, data: settings });
  },

  async updateSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const body = updateSettingsSchema.parse(request.body);

      const settings = await (prisma as any).userSettings.upsert({
        where: { userId: user.userId },
        update: body,
        create: {
          ...body,
          userId: user.userId,
        },
      });

      return reply.status(200).send({ success: true, data: settings });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ success: false, message: 'Invalid input' });
      }
      request.log.error(error);
      reply.status(500).send({ success: false, message: 'Failed to update settings' });
    }
  }
};
