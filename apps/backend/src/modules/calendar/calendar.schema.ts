import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  location: z.string().optional(),
  type: z.enum(['event', 'holiday', 'exam', 'meeting']).default('event'),
});

export const updateEventSchema = createEventSchema.partial();
