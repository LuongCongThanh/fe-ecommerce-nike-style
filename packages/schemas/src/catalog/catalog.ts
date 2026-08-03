import { z } from 'zod';

import { PaginationMetaSchema, PaginationQuerySchema } from '../common/pagination';

export { ErrorEnvelopeSchema as CatalogErrorSchema } from '../errors/envelope';
export type { ErrorEnvelope as CatalogError } from '../errors/envelope';

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  price: z.number(),
});

export const ProductListRequestSchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
});

export const ProductListResponseSchema = z.object({
  data: z.array(ProductSchema),
  meta: PaginationMetaSchema,
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductListRequest = z.infer<typeof ProductListRequestSchema>;
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
