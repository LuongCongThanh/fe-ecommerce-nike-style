import { z } from 'zod';

export const filterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  ordering: z.enum(['price', '-price', '-created_at', 'rating']).optional(),
  page: z.coerce.number().default(1),
});

export type FilterInput = z.infer<typeof filterSchema>;
