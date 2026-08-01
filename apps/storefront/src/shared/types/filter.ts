import { z } from 'zod';

import { APP_CONFIG } from '@/shared/constants/app-config';

const optionalString = z.union([z.string(), z.undefined()]).transform((value) => {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
});

const optionalNumber = z.preprocess((value) => {
  if (value == null || value === '') return undefined;
  return value;
}, z.coerce.number());

const optionalBooleanFromSearchParam = z.preprocess((value) => {
  if (value == null || value === '') return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return value;
}, z.boolean().optional());

export const ProductFilterSchema = z.object({
  search: optionalString.optional(),
  category: optionalString.optional(),
  minPrice: optionalNumber.pipe(z.number().nonnegative()).optional(),
  maxPrice: optionalNumber.pipe(z.number().positive()).optional(),
  ordering: z.enum(['-created_at', 'price', '-price', 'rating']).optional(),
  inStock: optionalBooleanFromSearchParam,
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(APP_CONFIG.ITEMS_PER_PAGE),
});

export type ProductFilter = z.infer<typeof ProductFilterSchema>;
