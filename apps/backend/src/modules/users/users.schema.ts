import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Name too short').optional(),
    avatar_url: z.string().optional(),
    phone_number: z.string().optional(),
    gender: z.string().optional(),
  }),
});

export const promoteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['teacher', 'security', 'admin', 'parent']),
  }),
});

export const paramsIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type PromoteUserInput = z.infer<typeof promoteUserSchema>['body'];
export type ParamsIdInput = z.infer<typeof paramsIdSchema>['params'];
