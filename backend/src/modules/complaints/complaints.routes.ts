import { FastifyInstance } from 'fastify';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  assignComplaint,
  updateComplaintStatus,
} from './complaints.controller';
import { authenticate } from '../../common/middleware/authenticate';

export default async function complaintRoutes(fastify: FastifyInstance) {
  // All complaint routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Parent routes
  fastify.post('/', createComplaint);
  fastify.get('/my', getMyComplaints);

  // Admin routes
  fastify.get('/all', getAllComplaints);
  fastify.put('/:id/assign', assignComplaint);

  // Admin and Assigned Staff routes
  fastify.put('/:id/status', updateComplaintStatus);

  // View specific complaint (Admin, Parent, or Assigned Staff)
  fastify.get('/:id', getComplaintById);
}