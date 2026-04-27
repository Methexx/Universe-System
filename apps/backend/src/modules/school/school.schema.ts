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
    gender: z.string().optional().nullable(),
    parent_email: z.string().email('Invalid email').optional().nullable(),
    parent_mobile: z.string().optional().nullable(),
    parent_name: z.string().optional().nullable(),
    photo_url: z.string().optional().nullable(),
    student_id_no: z.string().min(1).optional()
  }),
});

export const updateStudentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Student ID is required')
  }),
  body: z.object({
    full_name: z.string().min(2, 'Name too short').optional(),
    date_of_birth: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
    class_id: z.string().uuid('Invalid class ID').optional().nullable(),
    gender: z.string().optional().nullable(),
    parent_email: z.string().email('Invalid email').optional().nullable(),
    parent_mobile: z.string().optional().nullable(),
    parent_name: z.string().optional().nullable(),
    photo_url: z.string().optional().nullable(),
    is_active: z.boolean().optional()
  }),
});

export const updateClassSchema = z.object({
  body: z.object({
    teacher_id: z.string().uuid('Invalid teacher ID').nullable().optional(),
    name: z.string().min(1).optional(),
    subject: z.string().optional().nullable(),
  }),
});

export type CreateGradeInput = z.infer<typeof createGradeSchema>['body'];
export type CreateClassInput = z.infer<typeof createClassSchema>['body'];
export type CreateStudentInput = z.infer<typeof createStudentSchema>['body'];
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>['body'];
export type UpdateClassInput = z.infer<typeof updateClassSchema>['body'];