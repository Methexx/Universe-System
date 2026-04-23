import { FastifyInstance } from 'fastify';
import { markAttendance, getAttendance } from './attendance.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/rbac';

export default async function attendanceRoutes(fastify: FastifyInstance) {
  // Setup route hooks for authentication
  fastify.addHook('preHandler', authenticate);

  // Mark/update attendance (Teachers, Admins)
  fastify.post(
    '/mark',
    {
      preHandler: [authorize(['admin', 'teacher'])],
    },
    markAttendance
  );

  // Get attendance records
  fastify.get(
    '/',
    {
      preHandler: [authorize(['admin', 'teacher', 'security'])],
    },
    getAttendance
  );
}