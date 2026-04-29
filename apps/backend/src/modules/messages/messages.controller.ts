import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import { sendSchema, aiDraftSchema } from './messages.schema';
import { z } from 'zod';
import { delCacheByPattern, getOrSetCache } from '../../common/utils/cache';

export const getInbox = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const userId = user.userId;

  try {
    const threads = await getOrSetCache(`messages:inbox:${userId}`, async () => {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { sender_id: userId },
            { receiver_id: userId },
          ],
        },
        include: {
          sender: { select: { id: true, full_name: true, role: true, avatar_url: true, last_seen: true } as any },
          receiver: { select: { id: true, full_name: true, role: true, avatar_url: true, last_seen: true } as any },
          student: { select: { full_name: true } as any },
        },
        orderBy: { created_at: 'desc' },
      });

      const grouped = messages.reduce((acc, message: any) => {
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        const userObj: any = message.sender_id === userId ? message.receiver : message.sender;
        const isOnline = userObj.last_seen ? (new Date().getTime() - new Date(userObj.last_seen).getTime()) < 30000 : false;

        if (!acc[otherUserId]) {
          acc[otherUserId] = {
            user: {
              id: otherUserId,
              ...userObj,
              is_online: isOnline,
            },
            lastMessage: message,
            unreadCount: 0,
          };
        }
        if (message.receiver_id === userId && !message.is_read) {
          acc[otherUserId].unreadCount += 1;
        }
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped);
    });

    return reply.status(200).send({ success: true, data: threads });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Failed to fetch inbox', error: error.message });
  }
};

export const getContacts = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const userId = user.userId;
  const role = user.role;

  try {
    let contacts: any[] = [];

    if (role === 'admin') {
      // Admin can message all teachers and security
      contacts = (await prisma.user.findMany({
        where: {
          role: { in: ['teacher', 'security'] },
          is_active: true,
        },
        select: { id: true, full_name: true, role: true, avatar_url: true, last_seen: true } as any,
      })) as any[];
      contacts = contacts.map(c => ({
        ...c,
        is_online: c.last_seen ? (new Date().getTime() - new Date(c.last_seen).getTime()) < 30000 : false
      }));
    } else if (role === 'teacher') {
      // Teacher can message all admins, security, and parents of their students
      const adminsAndSecurity = (await prisma.user.findMany({
        where: {
          role: { in: ['admin', 'security'] },
          is_active: true,
        },
        select: { id: true, full_name: true, role: true, avatar_url: true, last_seen: true } as any,
      })) as any[];

      const myClasses = await prisma.class.findMany({
        where: { teacher_id: userId },
        select: { id: true },
      });
      const classIds = myClasses.map((c) => c.id);

      const parents = (await prisma.parentStudent.findMany({
        where: {
          student: { class_id: { in: classIds } },
        },
        include: {
          parent: {
            select: { id: true, full_name: true, role: true, avatar_url: true, last_seen: true } as any,
          },
          student: {
            select: { full_name: true } as any,
          },
        },
      })) as any[];

      // Group parents and unique them
      const parentMap = new Map();
      parents.forEach((ps) => {
        if (!parentMap.has(ps.parent.id)) {
          parentMap.set(ps.parent.id, {
            ...ps.parent,
            student_name: ps.student.full_name,
          });
        }
      });

      contacts = [...adminsAndSecurity, ...Array.from(parentMap.values())].map(c => ({
        ...c,
        is_online: c.last_seen ? (new Date().getTime() - new Date(c.last_seen).getTime()) < 30000 : false
      }));
    } else if (role === 'security') {
      // Security can message all admins and teachers
      contacts = (await prisma.user.findMany({
        where: {
          role: { in: ['admin', 'teacher'] },
          is_active: true,
        },
        select: { id: true, full_name: true, role: true, avatar_url: true, last_seen: true } as any,
      })) as any[];
      contacts = contacts.map(c => ({
        ...c,
        is_online: c.last_seen ? (new Date().getTime() - new Date(c.last_seen).getTime()) < 30000 : false
      }));
    } else if (role === 'parent') {
      // Parent can message teachers of their children
      const myStudents = await prisma.parentStudent.findMany({
        where: { parent_id: userId },
        select: { student_id: true },
      });
      const studentIds = myStudents.map((s) => s.student_id);

      const classes = (await prisma.class.findMany({
        where: {
          students: { some: { id: { in: studentIds } } },
        },
        include: {
          teacher: {
            select: { id: true, full_name: true, role: true, avatar_url: true, last_seen: true } as any,
          },
        },
      })) as any[];

      const teacherMap = new Map();
      classes.forEach((c) => {
        if (c.teacher && !teacherMap.has(c.teacher.id)) {
          teacherMap.set(c.teacher.id, {
            ...c.teacher,
            class_name: c.name,
          });
        }
      });

      contacts = Array.from(teacherMap.values()).map(c => ({
        ...c,
        is_online: c.last_seen ? (new Date().getTime() - new Date(c.last_seen).getTime()) < 30000 : false
      }));
    }

    return reply.status(200).send({ success: true, data: contacts });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Failed to fetch contacts', error: error.message });
  }
};

export const getThread = async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
  const user = (request as any).user;
  const currentUserId = user.userId;
  const { userId } = request.params;

  try {
    const cacheKey = `messages:thread:${currentUserId}:${userId}`;
    const messages = await getOrSetCache(cacheKey, () =>
      prisma.message.findMany({
        where: {
          OR: [
            { sender_id: currentUserId, receiver_id: userId },
            { sender_id: userId, receiver_id: currentUserId },
          ],
        },
        include: {
          sender: { select: { id: true, full_name: true, role: true, avatar_url: true } },
          receiver: { select: { id: true, full_name: true, role: true, avatar_url: true } },
        },
        orderBy: { created_at: 'asc' },
      })
    );

    return reply.status(200).send({ success: true, data: messages });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Failed to fetch thread', error: error.message });
  }
};

export const sendMessage = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const senderId = user.userId;

  try {
    const data = sendSchema.parse(request.body);

    // Validate if sender is allowed to message receiver
    const receiver = await prisma.user.findUnique({
      where: { id: data.receiver_id },
      select: { role: true },
    });

    if (!receiver) {
      return reply.status(404).send({ success: false, message: 'Receiver not found' });
    }

    const senderRole = user.role;
    const receiverRole = receiver.role;
    let allowed = false;

    if (senderRole === 'admin') {
      allowed = ['teacher', 'security'].includes(receiverRole);
    } else if (senderRole === 'teacher') {
      if (['admin', 'security'].includes(receiverRole)) {
        allowed = true;
      } else if (receiverRole === 'parent') {
        // Check if parent has a student in teacher's class
        const connection = await prisma.parentStudent.findFirst({
          where: {
            parent_id: data.receiver_id,
            student: { class: { teacher_id: senderId } },
          },
        });
        allowed = !!connection;
      }
    } else if (senderRole === 'security') {
      allowed = ['admin', 'teacher'].includes(receiverRole);
    } else if (senderRole === 'parent') {
      if (receiverRole === 'teacher') {
        // Check if teacher teaches a class where parent's child is enrolled
        const connection = await prisma.parentStudent.findFirst({
          where: {
            parent_id: senderId,
            student: { class: { teacher_id: data.receiver_id } },
          },
        });
        allowed = !!connection;
      }
    }

    if (!allowed) {
      return reply.status(403).send({ success: false, message: 'You are not allowed to message this user' });
    }

    const message = await prisma.message.create({
      data: {
        sender_id: senderId,
        receiver_id: data.receiver_id,
        student_id: data.student_id,
        content: data.content,
      },
    });

    await delCacheByPattern(`messages:inbox:${senderId}`);
    await delCacheByPattern(`messages:inbox:${data.receiver_id}`);
    await delCacheByPattern(`messages:thread:${senderId}:*`);
    await delCacheByPattern(`messages:thread:${data.receiver_id}:*`);

    return reply.status(201).send({ success: true, data: { message_id: message.id, fcm_sent: true } });
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
    const updated = await prisma.message.update({
      where: { id },
      data: { is_read: true },
    });

    await delCacheByPattern(`messages:inbox:${user.userId}`);
    await delCacheByPattern(`messages:inbox:${updated.sender_id}`);
    await delCacheByPattern(`messages:thread:${user.userId}:*`);
    await delCacheByPattern(`messages:thread:${updated.sender_id}:*`);

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
      data: { draft: `Dear Parent, I wanted to reach out regarding the student's progress...` },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ success: false, errors: error.issues });
    }
    return reply.status(500).send({ success: false, message: 'Failed to generate AI draft', error: error.message });
  }
};
export const deleteMessage = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params;

  try {
    const msg = await prisma.message.findUnique({
      where: { id },
      select: { sender_id: true, receiver_id: true },
    });

    if (!msg) {
      return reply.status(404).send({ success: false, message: 'Message not found' });
    }

    if (msg.sender_id !== user.userId) {
      return reply.status(403).send({ success: false, message: 'You can only delete your own messages' });
    }

    await prisma.message.delete({
      where: { id },
    });

    await delCacheByPattern(`messages:inbox:${msg.sender_id}`);
    await delCacheByPattern(`messages:inbox:${msg.receiver_id}`);
    await delCacheByPattern(`messages:thread:${msg.sender_id}:*`);
    await delCacheByPattern(`messages:thread:${msg.receiver_id}:*`);

    return reply.status(200).send({ success: true });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Failed to delete message', error: error.message });
  }
};
