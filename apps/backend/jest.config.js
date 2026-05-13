/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/common/utils/**/*.ts',
    'src/modules/auth/**/*.ts',
  ],
  coverageThreshold: {
    global: { lines: 70 },
  },
};
