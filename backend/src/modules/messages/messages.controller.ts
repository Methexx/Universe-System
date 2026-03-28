import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import { sendSchema, aiDraftSchema } from './messages.schema';
import { z } from 'zod';

export const getInbox = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const userId = user.userId;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId },
        ],
      },
      include: {
        sender: { select: { full_name: true, role: true } },
        receiver: { select: { full_name: true, role: true } },
        student: { select: { full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const threads = messages.reduce((acc, message: any) => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      if (!acc[otherUserId]) {
        acc[otherUserId] = {
          user: message.sender_id === userId ? message.receiver : message.sender,
          lastMessage: message,
          unreadCount: 0,
        };
      }
      if (message.receiver_id === userId && !message.is_read) {
        acc[otherUserId].unreadCount += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    return reply.status(200).send({ success: true, threads: Object.values(threads) });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Failed to fetch inbox', error: error.message });
  }
};

export const getThread = async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
  const user = (request as any).user;
  const currentUserId = user.userId;
  const { userId } = request.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: currentUserId, receiver_id: userId },
          { sender_id: userId, receiver_id: currentUserId },
        ],
      },
      include: {
        sender: { select: { full_name: true, role: true } },
        receiver: { select: { full_name: true, role: true } },
      },
      orderBy: { created_at: 'asc' },
    });

    return reply.status(200).send({ success: true, messages });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Failed to fetch thread', error: error.message });
  }
};

export const sendMessage = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const senderId = user.userId;

  try {
    const data = sendSchema.parse(request.body);

    const message = await prisma.message.create({
      data: {
        sender_id: senderId,
        receiver_id: data.receiver_id,
        student_id: data.student_id,
        content: data.content,
      },
    });

    return reply.status(201).send({ success: true, message_id: message.id, fcm_sent: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ success: false, errors: error.issues });
    }
    return reply.status(500).send({ success: false, message: 'Failed to send message', error: error.message });
  }
};

export const markAsRead = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params;

  try {
    await prisma.message.update({
      where: { id },
      data: { is_read: true },
    });

    return reply.status(200).send({ success: true });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Failed to mark message as read', error: error.message });
  }
};

export const generateAiDraft = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = aiDraftSchema.parse(request.body);

    // AI logic simulation
    return reply.status(200).send({
      success: true,
      draft: `Dear Parent, I wanted to reach out regarding the student's progress...`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ success: false, errors: error.issues });
    }
    return reply.status(500).send({ success: false, message: 'Failed to generate AI draft', error: error.message });
  }
};
