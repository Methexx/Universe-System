import { z } from 'zod';

export const markAttendanceSchema = z.object({
  student_id: z.string().uuid("Invalid student ID"),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
  remarks: z.string().optional()
});

export const getAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
  class_id: z.string().uuid("Invalid class ID").optional()
});

// --- Session schemas ---

export const createSessionSchema = z.object({
  class_id: z.string().uuid(),
});

export const getSessionSchema = z.object({
  class_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const submitSessionSchema = z.object({
  session_id: z.string().uuid(),
  marks: z.array(z.object({
    student_id: z.string().uuid(),
    status: z.enum(['present', 'absent', 'late', 'excused']),
    remarks: z.string().optional(),
  })),
});

export const getSessionDatesSchema = z.object({
  class_id: z.string().uuid(),
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const getAttendanceSummarySchema = z.object({
  class_id: z.string().uuid(),
  range: z.enum(['month', 'term']).optional().default('month'),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
});