import { z } from 'zod';

export const createComplaintSchema = z.object({
  student_id: z.string().uuid('Invalid student ID').optional(),
  category: z.enum([
    'academic',
    'teacher_conduct',
    'facility',
    'administrative',
    'suggestion',
    'other',
  ]),
  description: z.string().min(1, 'Description is required'),
});

export const assignComplaintSchema = z.object({
  assigned_to_id: z.string().uuid('Invalid teacher/staff ID'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'resolved', 'rejected']),
  reply_note: z.string().optional(),
});