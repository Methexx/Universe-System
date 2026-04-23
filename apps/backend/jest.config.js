/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  // Only picks up *.test.js / *.spec.js / *.test.ts / *.spec.ts — NOT the existing integration scripts in tests/
  testMatch: ['**/*.test.js', '**/*.spec.js', '**/*.test.ts', '**/*.spec.ts'],
  passWithNoTests: true,
};
