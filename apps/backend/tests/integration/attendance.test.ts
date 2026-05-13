import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { generateToken } from '../../src/common/utils/jwt';

jest.mock('../../src/config/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    attendanceSession: { findUnique: jest.fn(), create: jest.fn() },
    attendanceRecord: { upsert: jest.fn(), findMany: jest.fn() },
    student: { findMany: jest.fn() },
  }
}));

describe('Attendance Integration', () => {
  const mockToken = generateToken({ userId: 'teacher-123', role: 'teacher', email: 'teacher@school.com' });
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/attendance/session', () => {
    test('should return 201 when creating a new session', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'teacher', is_active: true });
      (prisma.attendanceSession.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.attendanceSession.create as jest.Mock).mockResolvedValue({ id: 'session-1', class_id: validUuid });

      const response = await request(app.server)
        .post('/api/attendance/session')
        .set('Cookie', [`auth_token=${mockToken}`])
        .send({ class_id: validUuid });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.alreadyExists).toBe(false);
    });

    test('should return 200 with alreadyExists true if session exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'teacher', is_active: true });
      (prisma.attendanceSession.findUnique as jest.Mock).mockResolvedValue({ id: 'session-1', class_id: validUuid });

      const response = await request(app.server)
        .post('/api/attendance/session')
        .set('Cookie', [`auth_token=${mockToken}`])
        .send({ class_id: validUuid });

      expect(response.status).toBe(200);
      expect(response.body.data.alreadyExists).toBe(true);
    });
  });

  describe('POST /api/attendance/session/submit', () => {
    test('should return 200 on valid submission', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'teacher', is_active: true });
      (prisma.attendanceSession.findUnique as jest.Mock).mockResolvedValue({ 
        id: 'session-1', 
        class_id: validUuid,
        date: new Date() // Today
      });
      (prisma.attendanceRecord.upsert as jest.Mock).mockResolvedValue({});

      const response = await request(app.server)
        .post('/api/attendance/session/submit')
        .set('Cookie', [`auth_token=${mockToken}`])
        .send({
          session_id: validUuid,
          marks: [
            { student_id: validUuid, status: 'present' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return 400 for invalid status', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'teacher', is_active: true });
      
      const response = await request(app.server)
        .post('/api/attendance/session/submit')
        .set('Cookie', [`auth_token=${mockToken}`])
        .send({
          session_id: validUuid,
          marks: [
            { student_id: validUuid, status: 'invalid-status' }
          ]
        });

      expect(response.status).toBe(400);
    });
  });
});
