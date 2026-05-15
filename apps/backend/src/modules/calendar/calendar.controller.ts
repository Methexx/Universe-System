import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import { createEventSchema, updateEventSchema } from './calendar.schema';
import { z } from 'zod';

export const createEvent = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  
  if (user.role !== 'admin') {
    return reply.status(403).send({ success: false, message: 'Admin access required' });
  }

  try {
    const data = createEventSchema.parse(request.body);

    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        start_time: new Date(data.start_time),
        end_time: new Date(data.end_time),
        location: data.location,
        type: data.type,
        created_by: user.userId,
      },
    });

    return reply.status(201).send({ success: true, message: 'Event created successfully', data: event });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ success: false, errors: error.issues });
    }
    return reply.status(500).send({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getEvents = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const events = await prisma.calendarEvent.findMany({
      orderBy: { start_time: 'asc' },
      include: {
        creator: { select: { full_name: true } }
      }
    });

    return reply.status(200).send({ success: true, data: events });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Server Error', error: error.message });
  }
};

export const updateEvent = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params;

  if (user.role !== 'admin') {
    return reply.status(403).send({ success: false, message: 'Admin access required' });
  }

  try {
    const data = updateEventSchema.parse(request.body);

    const updateData: any = { ...data };
    if (data.start_time) updateData.start_time = new Date(data.start_time);
    if (data.end_time) updateData.end_time = new Date(data.end_time);

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: updateData,
    });

    return reply.status(200).send({ success: true, message: 'Event updated successfully', data: event });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ success: false, errors: error.issues });
    }
    return reply.status(500).send({ success: false, message: 'Server Error', error: error.message });
  }
};

export const deleteEvent = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const user = (request as any).user;
  const { id } = request.params;

  if (user.role !== 'admin') {
    return reply.status(403).send({ success: false, message: 'Admin access required' });
  }

  try {
    await prisma.calendarEvent.delete({ where: { id } });
    return reply.status(200).send({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    return reply.status(500).send({ success: false, message: 'Server Error', error: error.message });
  }
};
