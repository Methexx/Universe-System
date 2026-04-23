import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['teacher', 'security', 'parent']).default('parent'),
    student_id_no: z.string().min(4).optional(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
    new_password: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export const linkChildSchema = z.object({
  body: z.object({
    student_id_no: z.string().min(4, 'Student ID is required'),
    verification_method: z.enum(['email', 'sms']).default('email'),
  }),
});

export const updateFcmTokenSchema = z.object({
  body: z.object({
    fcm_token: z.string().min(8, 'Invalid FCM token').nullable(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ResendOtpInput = z.infer<typeof resendOtpSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type LinkChildInput = z.infer<typeof linkChildSchema>['body'];
export type UpdateFcmTokenInput = z.infer<typeof updateFcmTokenSchema>['body'];
