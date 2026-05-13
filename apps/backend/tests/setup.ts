import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Reset all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock Supabase — never hit real DB
jest.mock('../src/config/supabase', () => ({
  supabase: { from: jest.fn(), auth: { signUp: jest.fn() } },
  supabaseAdmin: { from: jest.fn(), auth: { admin: { createUser: jest.fn() } } },
}));

// Mock Prisma — never hit real DB
jest.mock('../src/config/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    attendanceSession: { findFirst: jest.fn(), create: jest.fn() },
    attendanceRecord: { upsert: jest.fn(), findMany: jest.fn() },
    gateLog: { create: jest.fn(), findMany: jest.fn() },
  },
  default: {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    attendanceSession: { findFirst: jest.fn(), create: jest.fn() },
    attendanceRecord: { upsert: jest.fn(), findMany: jest.fn() },
    gateLog: { create: jest.fn(), findMany: jest.fn() },
  },
}));

// Mock Firebase FCM — never send real push notifications
jest.mock('../src/config/firebase', () => ({
  messaging: jest.fn(() => ({
    send: jest.fn().mockResolvedValue('mock-message-id'),
  })),
}));

// Mock email (Resend) — never send real emails
jest.mock('../src/common/utils/email', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue({ success: true }),
  sendApprovalEmail: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock Redis cache
jest.mock('../src/config/redis', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
  },
}));
