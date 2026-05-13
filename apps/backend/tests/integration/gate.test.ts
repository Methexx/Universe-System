import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { generateToken } from '../../src/common/utils/jwt';

jest.mock('../../src/config/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    student: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn() },
    gateEvent: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    parentStudent: { findFirst: jest.fn() },
  }
}));

describe('Gate Integration', () => {
  const mockToken = generateToken({ userId: 'user-123', role: 'security', email: 'guard@school.com' });
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/gate/scan', () => {
    test('should return 200 for valid scan with auth', async () => {
      // Mock auth middleware calls
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'security', is_active: true });
      
      // Mock scan logic
      (prisma.student.findUnique as jest.Mock).mockResolvedValue({
        id: 'student-1',
        full_name: 'John Doe',
        student_id_no: 'S-001',
        is_active: true,
        class: { name: '10A', school_grade: { name: 'Grade 10' } }
      });
      (prisma.gateEvent.create as jest.Mock).mockResolvedValue({ id: 'event-1', direction: 'IN' });
      (prisma.parentStudent.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app.server)
        .post('/api/gate/scan')
        .set('Cookie', [`auth_token=${mockToken}`])
        .send({
          qr_code: validUuid,
          direction: 'IN',
          method: 'qr'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.student.full_name).toBe('John Doe');
    });

    test('should return 401 when no auth cookie', async () => {
      const response = await request(app.server)
        .post('/api/gate/scan')
        .send({
          qr_code: validUuid,
          direction: 'IN'
        });

      expect(response.status).toBe(401);
    });

    test('should return 404 for unknown QR code', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'security', is_active: true });
      (prisma.student.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app.server)
        .post('/api/gate/scan')
        .set('Cookie', [`auth_token=${mockToken}`])
        .send({
          qr_code: validUuid,
          direction: 'IN'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/gate/events', () => {
    test('should return 200 and list of events', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'security', is_active: true });
      (prisma.gateEvent.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app.server)
        .get('/api/gate/events')
        .set('Cookie', [`auth_token=${mockToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
