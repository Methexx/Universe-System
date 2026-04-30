import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import { createComplaintSchema, assignComplaintSchema, updateStatusSchema } from './complaints.schema';
import { z } from 'zod';

export const createComplaint = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  
  try {
    const data = createComplaintSchema.parse(request.body);

    const complaint = await prisma.complaint.create({
      data: {
        parent_id: user.userId,
        student_id: data.student_id,
        category: data.category,
        description: data.description,
        status: 'pending',
      },
    });

    return reply.status(201).send({ success: true, message: 'Complaint submitted successfully', data: complaint });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ success: false, errors: error.issues });
    }
    return reply.status(500).send({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getMyComplaints = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  try {
    const where: any = user.role === 'teacher'
      ? { assigned_to_id: user.userId }
      : { parent_id: user.userId };

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        parent: { select: { full_name: true, avatar_url: true } },
        student: { select: { full_name: true } },
        assigned_to: { select: { full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return reply.status(200).send({ success: true, data: complaints });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getComplaintById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params;

  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        parent: { select: { full_name: true, email: true } },
        student: { select: { full_name: true } },
        assigned_to: { select: { full_name: true } },
        resolved_by: { select: { full_name: true } },
      }
    });

    if (!complaint) {
      return reply.status(404).send({ success: false, message: 'Complaint not found' });
    }

    // RBAC logic to view complaint
    if (
      user.role !== 'admin' &&
      complaint.parent_id !== user.userId &&
      complaint.assigned_to_id !== user.userId
    ) {
      return reply.status(403).send({ success: false, message: 'Access denied' });
    }

    return reply.status(200).send({ success: true, data: complaint });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getAllComplaints = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (user.role !== 'admin') {
    return reply.status(403).send({ success: false, message: 'Admin access required' });
  }

  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        parent: { select: { full_name: true } },
        assigned_to: { select: { full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return reply.status(200).send({ success: true, data: complaints });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Server Error', error: error.message });
  }
};

export const assignComplaint = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params;

  if (user.role !== 'admin') {
    return reply.status(403).send({ success: false, message: 'Admin access required' });
  }

  try {
    const data = assignComplaintSchema.parse(request.body);

    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        assigned_to_id: data.assigned_to_id,
        status: 'assigned',
        assigned_at: new Date(),
      },
    });

    return reply.status(200).send({ success: true, message: 'Complaint assigned successfully', data: complaint });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ success: false, errors: error.issues });
    }
    return reply.status(500).send({ success: false, message: 'Server Error', error: error.message });
  }
};

export const updateComplaintStatus = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params;

  try {
    const data = updateStatusSchema.parse(request.body);

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ success: false, message: 'Complaint not found' });

    if (user.role !== 'admin' && existing.assigned_to_id !== user.userId) {
      return reply.status(403).send({ success: false, message: 'Not authorized to update this complaint status' });
    }

    const isResolved = data.status === 'resolved' || data.status === 'rejected';

    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        status: data.status,
        reply_note: data.reply_note,
        resolved_by_id: isResolved ? user.userId : undefined,
      },
    });

    return reply.status(200).send({ success: true, message: 'Complaint updated', data: complaint });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ success: false, errors: error.issues });
    }
    return reply.status(500).send({ success: false, message: 'Server Error', error: error.message });
  }
};