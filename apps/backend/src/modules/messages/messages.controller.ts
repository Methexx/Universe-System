import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import { sendSchema, aiDraftSchema } from './messages.schema';
import { z } from 'zod';
import { delCacheByPattern, getOrSetCache } from '../../common/utils/cache';
import { notifyUser } from '../notifications/notifications.service';
import { redis } from '../../config/redis';

async function isOnline(userId: string): Promise<boolean> {
  if (!redis?.isOpen) return false;
  return (await redis.exists(`user:online:${userId}`)) === 1;
}

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
          sender: { select: { id: true, full_name: true, role: true, avatar_url: true } as any },
          receiver: { select: { id: true, full_name: true, role: true, avatar_url: true } as any },
          student: { select: { full_name: true } as any },
        },
        orderBy: { created_at: 'desc' },
      });

      const grouped: Record<string, any> = {};
      for (const message of messages as any[]) {
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        const userObj: any = message.sender_id === userId ? message.receiver : message.sender;

        if (!grouped[otherUserId]) {
          grouped[otherUserId] = {
            user: {
              id: otherUserId,
              ...userObj,
              is_online: await isOnline(otherUserId),
            },
            lastMessage: message,
            unreadCount: 0,
          };
        }
        if (message.receiver_id === userId && !message.is_read) {
          grouped[otherUserId].unreadCount += 1;
        }
      }

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
    const contacts = await getOrSetCache(`messages:contacts:${userId}`, async () => {
      const userSelect = { id: true, full_name: true, role: true, avatar_url: true } as any;
      let raw: any[] = [];

      if (role === 'admin') {
        raw = await prisma.user.findMany({
          where: { role: { in: ['teacher', 'security'] }, is_active: true },
          select: userSelect,
        }) as any[];
      } else if (role === 'teacher') {
        const adminsAndSecurity = await prisma.user.findMany({
          where: { role: { in: ['admin', 'security'] }, is_active: true },
          select: userSelect,
        }) as any[];

        // 1. Discovery: Find all student IDs the teacher is "assigned" to or has interacted with
        const [studentsViaMainClass, studentsViaAttendance, studentsViaGrades, previousMessages] = await Promise.all([
          // Students in classes where this teacher is the main teacher
          prisma.student.findMany({ 
            where: { class: { teacher_id: userId }, is_active: true }, 
            select: { id: true } 
          }),
          // Students where this teacher has marked attendance
          prisma.attendanceRecord.findMany({ 
            where: { marked_by_id: userId }, 
            select: { student_id: true }, 
            distinct: ['student_id'] 
          }),
          // Students where this teacher has entered grades
          prisma.studentGrade.findMany({ 
            where: { result_set: { teacher_id: userId } }, 
            select: { student_id: true }, 
            distinct: ['student_id'] 
          }),
          // Parents this teacher has already messaged
          prisma.message.findMany({
            where: {
              OR: [{ sender_id: userId }, { receiver_id: userId }],
            },
            include: {
              sender: { select: userSelect },
              receiver: { select: userSelect },
              student: { select: { id: true, full_name: true } },
            },
          }),
        ]);

        const studentIdSet = new Set<string>();
        studentsViaMainClass.forEach((s: any) => studentIdSet.add(s.id));
        studentsViaAttendance.forEach((s: any) => studentIdSet.add(s.student_id));
        studentsViaGrades.forEach((s: any) => studentIdSet.add(s.student_id));

        // 2. Fetch parents linked to these students
        const parentLinks = await prisma.parentStudent.findMany({
          where: { 
            student_id: { in: Array.from(studentIdSet) },
            parent: { is_active: true }
          },
          include: {
            parent: { select: userSelect },
            student: { select: { id: true, full_name: true } as any },
          },
        }) as any[];

        const parentMap = new Map();
        
        // Add parents from links
        parentLinks.forEach((ps: any) => {
          if (ps.parent && !parentMap.has(ps.parent.id)) {
            parentMap.set(ps.parent.id, {
              ...ps.parent,
              student_name: ps.student.full_name,
              student_id: ps.student.id,
            });
          }
        });

        // 3. Email-based Discovery: Find registered parents by matching Student.parent_email
        const students = await prisma.student.findMany({
          where: { id: { in: Array.from(studentIdSet) }, is_active: true },
          select: { parent_email: true, full_name: true, id: true }
        });
        
        const parentEmails = students
          .map(s => s.parent_email?.trim().toLowerCase())
          .filter(e => !!e) as string[];

        if (parentEmails.length > 0) {
          const registeredParents = await prisma.user.findMany({
            where: { email: { in: parentEmails }, role: 'parent', is_active: true },
            select: userSelect
          }) as any[];

          registeredParents.forEach(p => {
            if (!parentMap.has(p.id)) {
              const student = students.find(s => s.parent_email?.trim().toLowerCase() === p.email.toLowerCase());
              parentMap.set(p.id, {
                ...p,
                student_name: student?.full_name,
                student_id: student?.id
              });
            }
          });
        }

        // 4. Add parents from previous messages
        previousMessages.forEach((msg: any) => {
          const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
          if (otherUser && otherUser.role === 'parent' && !parentMap.has(otherUser.id)) {
            parentMap.set(otherUser.id, {
              ...otherUser,
              student_name: msg.student?.full_name,
              student_id: msg.student_id,
            });
          }
        });

        raw = [...adminsAndSecurity, ...Array.from(parentMap.values())];
      } else if (role === 'security') {
        raw = await prisma.user.findMany({
          where: { role: { in: ['admin', 'teacher'] }, is_active: true },
          select: userSelect,
        }) as any[];
      } else if (role === 'parent') {
        const myStudents = await prisma.parentStudent.findMany({
          where: { parent_id: userId },
          select: { student_id: true },
        });
        const studentIds = myStudents.map((s: { student_id: string }) => s.student_id);

        const students = await prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { class_id: true }
        });
        const classIds = students.map(s => s.class_id).filter(id => !!id) as string[];

        // Find all teachers involved with these classes (Main teacher, Attendance, or Results)
        const [classesWithMain, sessions, results] = await Promise.all([
          prisma.class.findMany({ 
            where: { id: { in: classIds } }, 
            include: { teacher: { select: userSelect } } 
          }),
          prisma.attendanceSession.findMany({ 
            where: { class_id: { in: classIds } }, 
            include: { teacher: { select: userSelect } } 
          }),
          prisma.resultSet.findMany({ 
            where: { class_id: { in: classIds } }, 
            include: { teacher: { select: userSelect } } 
          }),
        ]);

        const teacherMap = new Map();
        const addTeacher = (t: any, className?: string) => {
          if (t && !teacherMap.has(t.id)) {
            teacherMap.set(t.id, { ...t, class_name: className });
          }
        };

        classesWithMain.forEach((c: any) => addTeacher(c.teacher, c.name));
        sessions.forEach((s: any) => addTeacher(s.teacher));
        results.forEach((r: any) => addTeacher(r.teacher));

        raw = Array.from(teacherMap.values());
      }

      return Promise.all(
        raw.map(async (c) => ({ ...c, is_online: await isOnline(c.id) }))
      );
    }, 60);

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

    // Notify the receiver — persists an in-app notification + FCM push.
    await notifyUser(data.receiver_id, {
      type: 'message',
      title: `New Message from ${user.full_name ?? 'Someone'}`,
      body: data.content.length > 50 ? data.content.substring(0, 47) + '...' : data.content,
      data: { route: '/messages', senderId, messageId: message.id },
    });

    await delCacheByPattern(`messages:inbox:${senderId}`);
    await delCacheByPattern(`messages:inbox:${data.receiver_id}`);
    await delCacheByPattern(`messages:thread:${senderId}:*`);
    await delCacheByPattern(`messages:thread:${data.receiver_id}:*`);
    await delCacheByPattern(`messages:contacts:${senderId}`);
    await delCacheByPattern(`messages:contacts:${data.receiver_id}`);

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

    await delCacheByPattern(`messages:inbox:${updated.sender_id}`);
    await delCacheByPattern(`messages:inbox:${updated.receiver_id}`);
    await delCacheByPattern(`messages:thread:${updated.sender_id}:*`);
    await delCacheByPattern(`messages:thread:${updated.receiver_id}:*`);
    await delCacheByPattern(`messages:contacts:${updated.sender_id}`);
    await delCacheByPattern(`messages:contacts:${updated.receiver_id}`);

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
