import { z } from 'zod';

// ── Term schemas ─────────────────────────────────────────────────────────────

export const createTermSchema = z.object({
  label: z.string().min(1, 'Term label is required'),
});

export const updateTermSchema = z.object({
  label: z.string().min(1, 'Term label is required'),
});

// ── Result set schemas ───────────────────────────────────────────────────────

export const createResultSetSchema = z.object({
  term_id: z.string().uuid('term_id must be a valid UUID'),
});

export const saveResultSetSchema = z.object({
  modules: z.array(
    z.object({
      name: z.string().min(1),
      order_index: z.number().int().min(0),
    })
  ),
  grades: z.array(
    z.object({
      student_id: z.string().uuid(),
      module_name: z.string().min(1),
      score: z.number().min(0).max(100),
    })
  ),
});

export type CreateTermInput = z.infer<typeof createTermSchema>;
export type UpdateTermInput = z.infer<typeof updateTermSchema>;
export type CreateResultSetInput = z.infer<typeof createResultSetSchema>;
export type SaveResultSetInput = z.infer<typeof saveResultSetSchema>;
