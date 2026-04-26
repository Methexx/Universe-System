import { z } from 'zod';

export const createGradeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Grade name is required'),
  }),
});

export const createClassSchema = z.object({
  body: z.object({
    school_grade_id: z.string().uuid('Invalid grade ID'),
    name: z.string().min(1, 'Class name is required'),
    teacher_id: z.string().uuid('Invalid teacher ID').optional().nullable(),
    subject: z.string().optional().nullable()
  }),
});

export const createStudentSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Name too short'),
    date_of_birth: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format'),
    class_id: z.string().uuid('Invalid class ID').optional().nullable(),
    parent_email: z.string().email('Invalid email').optional().nullable(),
    parent_mobile: z.string().optional().nullable(),
    student_id_no: z.string().min(1).optional()
  }),
});

export type CreateGradeInput = z.infer<typeof createGradeSchema>['body'];
export type CreateClassInput = z.infer<typeof createClassSchema>['body'];
export type CreateStudentInput = z.infer<typeof createStudentSchema>['body'];