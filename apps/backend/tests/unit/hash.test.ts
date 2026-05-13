import { hashPassword, comparePassword } from '../../src/common/utils/hash';

describe('Hash Utility', () => {
  const password = 'secret-password';

  test('hashPassword should return a string different from input', async () => {
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(typeof hash).toBe('string');
  });

  test('hashPassword result should start with $2 (bcrypt prefix)', async () => {
    const hash = await hashPassword(password);
    expect(hash.startsWith('$2')).toBe(true);
  });

  test('comparePassword should return true for correct password', async () => {
    const hash = await hashPassword(password);
    const result = await comparePassword(password, hash);
    expect(result).toBe(true);
  });

  test('comparePassword should return false for wrong password', async () => {
    const hash = await hashPassword(password);
    const result = await comparePassword('wrong-password', hash);
    expect(result).toBe(false);
  });

  test('two calls to hashPassword with same input produce different hashes (salt)', async () => {
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });
});
