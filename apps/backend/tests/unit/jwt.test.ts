import { generateToken, verifyToken } from '../../src/common/utils/jwt';
import jwt from 'jsonwebtoken';

describe('JWT Utility', () => {
  const payload = { id: '1', role: 'admin' };

  test('generateToken should return a non-empty string', () => {
    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('verifyToken should return object containing id and role for valid token', () => {
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded).toMatchObject(payload);
    expect(decoded).toHaveProperty('iat');
    expect(decoded).toHaveProperty('exp');
  });

  test('verifyToken should throw for expired token', () => {
    // Generate an expired token by setting expiresIn to a negative value or 0
    const token = generateToken(payload, '-1s');
    expect(() => verifyToken(token)).toThrow();
  });

  test('verifyToken should throw for invalid token', () => {
    expect(() => verifyToken('not.a.token')).toThrow();
  });

  test('payload should survive round-trip', () => {
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe(payload.role);
  });
});
