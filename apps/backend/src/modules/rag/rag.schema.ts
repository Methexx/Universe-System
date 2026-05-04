import { z } from 'zod';

export const querySchema = z.object({
  question: z.string().min(1).max(500),
  top_k: z.number().int().min(1).max(10).optional(),
});

export type QueryInput = z.infer<typeof querySchema>;
