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