import { z } from 'zod';

import { PaginationMetaSchema, PaginationQuerySchema } from '../common/pagination';

export { ErrorEnvelopeSchema as CatalogErrorSchema } from '../errors/envelope';
export type { ErrorEnvelope as CatalogError } from '../errors/envelope';

/** Product attribute, used as a PLP filter — never a Category node (glossary.md — Gender). */
export const GenderSchema = z.enum(['men', 'women', 'kids', 'unisex']);

/** Pure product-type tree (Shoes/Apparel/Accessories, with sub-categories) — flat rows + `parentId`, no Gender mixed in (glossary.md — Category). */
export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
});

/**
 * Sellable/stock unit. `Price` lives here, not on `Product` — SKUs of the same Product are allowed
 * to diverge in price (glossary.md — SKU). `color`/`size` are the two Variant axes; both `null` marks
 * the hidden 1:1 SKU of a Product with no Variant.
 */
export const SkuSchema = z.object({
  id: z.string(),
  price: z.number(),
  color: z.string().nullable(),
  size: z.string().nullable(),
});

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  images: z.array(z.string()),
  categoryId: z.string(),
  gender: GenderSchema,
  skus: z.array(SkuSchema).min(1),
});

export const ProductListRequestSchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
  /** Category slug — may be a top-level or leaf category; matches that category and its descendants. */
  category: z.string().optional(),
  gender: GenderSchema.optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
});

export const ProductListResponseSchema = z.object({
  data: z.array(ProductSchema),
  meta: PaginationMetaSchema,
});

export const CategoryListResponseSchema = z.object({
  data: z.array(CategorySchema),
});

export type Gender = z.infer<typeof GenderSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Sku = z.infer<typeof SkuSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductListRequest = z.infer<typeof ProductListRequestSchema>;
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;
