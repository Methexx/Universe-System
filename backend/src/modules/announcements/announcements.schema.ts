import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  content: z.string().min(5, "Content must be at least 5 characters"),
  scope: z.enum(['school_wide', 'class']).default('school_wide'),
  target: z.string().default('all'),
  class_id: z.string().uuid("Invalid class ID").optional().nullable()
}).refine(data => {
  if (data.scope === 'class' && !data.class_id) {
    return false;
  }
  return true;
}, {
  message: "class_id is required when scope is 'class'",
  path: ["class_id"]
});

export const getAnnouncementsSchema = z.object({
  scope: z.enum(['school_wide', 'class']).optional(),
  class_id: z.string().uuid("Invalid class ID").optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  page: z.coerce.number().min(1).default(1)
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type GetAnnouncementsInput = z.infer<typeof getAnnouncementsSchema>;