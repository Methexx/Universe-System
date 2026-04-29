import { FastifyInstance } from 'fastify';
import { GateController } from './gate.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/rbac';
import { scanQrSchema } from './gate.schema';

export default async function gateRoutes(fastify: FastifyInstance) {
  // All gate routes require authenticaton
  fastify.addHook('preHandler', authenticate);

  // ==========================
  // GATE SCANNING
  // ==========================

  // Perform a new scan (Admin or Security Staff only. Let's assume 'security' string, or admin/teacher if no strict security role yet)
  // For now, allow admin and teacher, assuming a teacher might act as gate duty
  fastify.post('/scan', {
    preHandler: [
      authorize(['admin', 'teacher', 'security']), // If 'security' role exists, add it here
      async (request) => { scanQrSchema.parse({ body: request.body }); }
    ]
  }, GateController.scanStudentCode);

  // Look up a student by their student_id_no (for manual entry)
  fastify.get<{ Querystring: { id: string } }>('/student', {
    preHandler: [authorize(['admin', 'security', 'teacher'])]
  }, GateController.getStudentByIdNo);

  // Gate stats for dashboard cards
  fastify.get('/stats', {
    preHandler: [authorize(['admin', 'security', 'teacher'])]
  }, GateController.getStats);

  // Retrieve recent scan events
  fastify.get('/events', {
    preHandler: [authorize(['admin', 'security', 'teacher'])]
  }, GateController.getRecentEvents);
}
