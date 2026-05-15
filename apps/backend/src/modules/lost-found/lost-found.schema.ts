import { z } from 'zod';

export const createItemSchema = z.object({
  item_name: z.string().min(3, "Item name must be at least 3 characters").max(255),
  description: z.string().optional().nullable(),
  photo_url: z.string().url("Invalid photo URL").optional().nullable(),
  found_at: z.string().optional().nullable(),
  found_date: z.string().refine(val => !val || !isNaN(Date.parse(val)), "Invalid date")
    .transform(val => val ? new Date(val).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
});

export const createReportSchema = z.object({
  student_id: z.string().uuid("Invalid student ID"),
  item_name: z.string().min(3, "Item name must be at least 3 characters").max(255),
  description: z.string().optional().nullable(),
  photo_url: z.string().url("Invalid photo URL").optional().nullable(),
  date_lost: z.string().refine(val => !val || !isNaN(Date.parse(val)), "Invalid date")
    .transform(val => val ? new Date(val).toISOString().split('T')[0] : undefined).optional()
});

export const updateStatusSchema = z.object({
  status: z.enum(['unclaimed', 'collected'])
});

export const updateReportStatusSchema = z.object({
  status: z.enum(['open', 'recovered'])
});

export const getItemsSchema = z.object({
  status: z.enum(['unclaimed', 'collected']).optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  page: z.coerce.number().min(1).default(1)
});

export const getReportsSchema = z.object({
  status: z.enum(['open', 'recovered']).optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  page: z.coerce.number().min(1).default(1)
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  item_id: z.string().uuid().optional(),
  report_id: z.string().uuid().optional()
}).refine(data => data.item_id || data.report_id, {
  message: "Either item_id or report_id must be provided"
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type GetItemsInput = z.infer<typeof getItemsSchema>;
export type GetReportsInput = z.infer<typeof getReportsSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
