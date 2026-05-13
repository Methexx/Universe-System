import request from 'supertest';
import app from '../../src/app';
import { AuthService } from '../../src/modules/auth/auth.service';
import { prisma } from '../../src/config/prisma';
import { generateToken } from '../../src/common/utils/jwt';

jest.mock('../../src/modules/auth/auth.service');
jest.mock('../../src/config/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
  }
}));

describe('Auth Integration', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    test('should return 200 on successful registration', async () => {
      (AuthService.register as jest.Mock).mockResolvedValue({ message: 'OTP sent to your email' });

      const response = await request(app.server)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'parent',
          student_id_no: 'S-12345'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return 400 when email is missing', async () => {
      const response = await request(app.server)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          password: 'password123',
          role: 'parent'
        });

      expect(response.status).toBe(400);
    });

    test('should return 409 when user already exists', async () => {
      (AuthService.register as jest.Mock).mockRejectedValue(new Error('User already exists'));

      const response = await request(app.server)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'exists@example.com',
          password: 'password123',
          role: 'parent',
          student_id_no: 'S-12345'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('EMAIL_EXISTS');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    test('should return 200 and set cookie on correct OTP', async () => {
      (AuthService.verifyOtp as jest.Mock).mockResolvedValue({
        token: 'mock-jwt-token',
        role: 'parent',
        user: { id: '1', email: 'test@example.com' }
      });

      const response = await request(app.server)
        .post('/api/auth/verify-otp')
        .send({
          email: 'test@example.com',
          otp_code: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.header['set-cookie']).toBeDefined();
      expect(response.header['set-cookie'][0]).toContain('auth_token=mock-jwt-token');
    });

    test('should return 400 on invalid OTP', async () => {
      (AuthService.verifyOtp as jest.Mock).mockRejectedValue(new Error('Invalid OTP'));

      const response = await request(app.server)
        .post('/api/auth/verify-otp')
        .send({
          email: 'test@example.com',
          otp_code: '000000'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('INVALID_OTP');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should return 200 and set cookie on valid credentials', async () => {
      (AuthService.login as jest.Mock).mockResolvedValue({
        token: 'mock-jwt-token',
        role: 'parent',
        user: { id: '1', email: 'test@example.com' }
      });

      const response = await request(app.server)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.header['set-cookie']).toBeDefined();
    });

    test('should return 401 on wrong password', async () => {
      (AuthService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app.server)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should clear cookie and return 200', async () => {
      const mockToken = generateToken({ userId: 'user-123', role: 'parent', email: 'test@example.com' });
      (AuthService.logout as jest.Mock).mockResolvedValue({ message: 'Logout successful' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'parent', is_active: true });

      const response = await request(app.server)
        .post('/api/auth/logout')
        .set('Cookie', [`auth_token=${mockToken}`]);

      expect(response.status).toBe(200);
      expect(response.header['set-cookie'][0]).toContain('auth_token=;');
    });
  });
});
