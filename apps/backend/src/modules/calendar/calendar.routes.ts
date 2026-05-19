import { FastifyInstance } from 'fastify';
import { createEvent, getEvents, updateEvent, deleteEvent } from './calendar.controller';
import { authenticate } from '../../common/middleware/authenticate';

export default async function calendarRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', getEvents);
  fastify.post('/', createEvent);
  fastify.put('/:id', updateEvent);
  fastify.delete('/:id', deleteEvent);
}
