import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().url().optional(),
  REDIS_DEFAULT_TTL: z.coerce.number().int().positive().default(120),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
  JWT_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  OPENAI_API_KEY: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  FLUTTER_ORIGIN: z.string().url().default('http://localhost:3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

export const env = envSchema.parse(process.env);
