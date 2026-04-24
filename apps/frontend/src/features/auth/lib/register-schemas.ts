import { z } from 'zod';

export const stepOneSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must be at most 80 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
      .regex(/[0-9]/, 'Must contain at least 1 number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type StepOneValues = z.infer<typeof stepOneSchema>;

export const otpSchema = z.object({
  otp_code: z.string().length(6, 'Enter the 6-digit code'),
});

export type OtpValues = z.infer<typeof otpSchema>;
