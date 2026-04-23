import { FastifyInstance } from 'fastify';
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from './announcements.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/rbac';

export default async function announcementRoutes(fastify: FastifyInstance) {
  // All routes are protected
  fastify.addHook('preHandler', authenticate);

  // POST: Create a new announcement (Admin or Teacher)
  fastify.post(
    '/',
    { preHandler: [authorize(['admin', 'teacher'])] },
    createAnnouncement
  );

  // GET: Fetch announcements (All roles)
  fastify.get(
    '/',
    getAnnouncements
  );

  // DELETE: Delete an announcement (Admin or Authoring Teacher)
  fastify.delete(
    '/:id',
    { preHandler: [authorize(['admin', 'teacher'])] },
    deleteAnnouncement
  );
}