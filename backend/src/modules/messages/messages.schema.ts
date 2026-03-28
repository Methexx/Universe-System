import { z } from 'zod';

export const sendSchema = z.object({
  receiver_id: z.string().uuid('Invalid receiver ID'),
  student_id: z.string().uuid('Invalid student ID').optional(),
  content: z.string().min(1, 'Message content cannot be empty'),
});

export const aiDraftSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
});