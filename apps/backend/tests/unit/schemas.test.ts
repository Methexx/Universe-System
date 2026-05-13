import { registerSchema, verifyOtpSchema, loginSchema } from '../../src/modules/auth/auth.schema';
import { scanQrSchema } from '../../src/modules/gate/gate.schema';
import { submitSessionSchema, createSessionSchema } from '../../src/modules/attendance/attendance.schema';
import { saveResultSetSchema } from '../../src/modules/results/results.schema';

describe('Zod Schemas', () => {
  describe('Auth Schemas', () => {
    test('registerSchema rejects when email is missing', () => {
      const result = registerSchema.safeParse({ body: { full_name: 'Test', password: 'password', role: 'parent' } });
      expect(result.success).toBe(false);
    });

    test('registerSchema rejects when email has no @', () => {
      const result = registerSchema.safeParse({ body: { full_name: 'Test', email: 'invalid', password: 'password', role: 'parent' } });
      expect(result.success).toBe(false);
    });

    test('registerSchema rejects when password is under 6 characters', () => {
      const result = registerSchema.safeParse({ body: { full_name: 'Test', email: 'test@test.com', password: '123', role: 'parent' } });
      expect(result.success).toBe(false);
    });

    test('registerSchema rejects when role is invalid', () => {
      const result = registerSchema.safeParse({ body: { full_name: 'Test', email: 'test@test.com', password: 'password', role: 'admin' } });
      expect(result.success).toBe(false);
    });

    test('verifyOtpSchema rejects when otp is not 6 digits', () => {
      const result = verifyOtpSchema.safeParse({ body: { email: 'test@test.com', otp_code: '12345' } });
      expect(result.success).toBe(false);
    });

    test('loginSchema rejects when password is missing', () => {
      const result = loginSchema.safeParse({ body: { email: 'test@test.com' } });
      expect(result.success).toBe(false);
    });
  });

  describe('Gate Schemas', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    
    test('scanQrSchema rejects direction values other than IN/OUT', () => {
      const result = scanQrSchema.safeParse({ body: { qr_code: validUuid, direction: 'UP' } });
      expect(result.success).toBe(false);
    });

    test('scanQrSchema accepts valid payload', () => {
      const result = scanQrSchema.safeParse({ body: { qr_code: validUuid, direction: 'IN', method: 'qr' } });
      expect(result.success).toBe(true);
    });
  });

  describe('Attendance Schemas', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    test('submitSessionSchema rejects status values outside present/absent/late/excused', () => {
      const result = submitSessionSchema.safeParse({
        session_id: validUuid,
        marks: [{ student_id: validUuid, status: 'vacation' }]
      });
      expect(result.success).toBe(false);
    });

    test('createSessionSchema rejects non-UUID class_id', () => {
      const result = createSessionSchema.safeParse({ class_id: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });
  });

  describe('Results Schemas', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    test('saveResultSetSchema rejects score > 100', () => {
      const result = saveResultSetSchema.safeParse({
        modules: [{ name: 'Math', order_index: 0 }],
        grades: [{ student_id: validUuid, module_name: 'Math', score: 101 }]
      });
      expect(result.success).toBe(false);
    });

    test('saveResultSetSchema accepts valid payload', () => {
      const result = saveResultSetSchema.safeParse({
        modules: [{ name: 'Math', order_index: 0 }],
        grades: [{ student_id: validUuid, module_name: 'Math', score: 95 }]
      });
      expect(result.success).toBe(true);
    });
  });
});
