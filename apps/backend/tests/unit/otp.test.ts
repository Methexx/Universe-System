import { generateOTP } from '../../src/common/utils/otp';

describe('OTP Utility', () => {
  test('should return a string', () => {
    const otp = generateOTP();
    expect(typeof otp).toBe('string');
  });

  test('should be exactly 6 characters long by default', () => {
    const otp = generateOTP();
    expect(otp.length).toBe(6);
  });

  test('should match 6 digits regex', () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
  });

  test('should generate unique values (entropy check)', () => {
    const otps = new Set();
    for (let i = 0; i < 5; i++) {
      otps.add(generateOTP());
    }
    // With 1 million possibilities, getting duplicates in 5 tries is extremely unlikely
    expect(otps.size).toBeGreaterThanOrEqual(2);
  });
});
