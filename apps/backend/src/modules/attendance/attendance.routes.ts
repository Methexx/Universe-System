import { FastifyInstance } from 'fastify';
import {
  markAttendance,
  getAttendance,
  createSession,
  getSession,
  submitSession,
  getSessionDates,
  getAttendanceSummary,
  getMyChildAttendance,
} from './attendance.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/rbac';

export default async function attendanceRoutes(fastify: FastifyInstance) {
  // Setup route hooks for authentication
  fastify.addHook('preHandler', authenticate);

  // ── Existing routes ────────────────────────────────────────────────────────
  // Mark/update attendance (Teachers, Admins)
  fastify.post('/mark', { preHandler: [authorize(['admin', 'teacher'])] }, markAttendance);

  // Get attendance records
  fastify.get('/', { preHandler: [authorize(['admin', 'teacher', 'security'])] }, getAttendance);

  // ── Session routes ─────────────────────────────────────────────────────────
  // NOTE: /session/submit and /session/dates must be registered before /session
  // to avoid Fastify matching /session first as a param route

  // Batch submit all marks for a session
  fastify.post('/session/submit', { preHandler: [authorize(['admin', 'teacher'])] }, submitSession);

  // Get dates that have sessions (for calendar)
  fastify.get('/session/dates', { preHandler: [authorize(['admin', 'teacher'])] }, getSessionDates);

  // Create session for today
  fastify.post('/session', { preHandler: [authorize(['admin', 'teacher'])] }, createSession);

  // Get session + records for a class on a date
  fastify.get('/session', { preHandler: [authorize(['admin', 'teacher'])] }, getSession);

  // ── Summary route ──────────────────────────────────────────────────────────
  // Get student attendance summary
  fastify.get('/summary', { preHandler: [authorize(['admin', 'teacher'])] }, getAttendanceSummary);

  // Parent: get their child's attendance history
  fastify.get('/my-child', { preHandler: [authorize(['parent'])] }, getMyChildAttendance);
}