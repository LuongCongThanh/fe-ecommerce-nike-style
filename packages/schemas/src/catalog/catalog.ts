import { z } from 'zod';

import { PaginationMetaSchema, PaginationQuerySchema } from '../common/pagination';

/** Product attribute, used as a PLP filter — never a Category node (glossary.md — Gender). */
export const GenderSchema = z.enum(['men', 'women', 'kids', 'unisex']);

/** Pure product-type tree (Shoes/Apparel/Accessories, with sub-categories) — flat rows + `parentId`, no Gender mixed in (glossary.md — Category). */
export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
});

/** Create/update payload (issue #20) — `id` isn't part of the input; `parentId: null` means top-level. */
export const CategoryInputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
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
  stock: z.number().int().nonnegative(),
  color: z.string().nullable(),
  size: z.string().nullable(),
});

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  images: z.array(z.string()),
  categoryId: z.string(),
  gender: GenderSchema,
  skus: z.array(SkuSchema).min(1),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
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

export const ProductDetailResponseSchema = z.object({
  data: ProductSchema,
});

/** A SKU in a create/update Product payload (issue #19 — Admin CRUD). `id` present = an existing SKU
 * being kept/edited; absent = a new Variant/SKU being added. Removing an existing `id` from the array
 * on update is how a SKU gets deleted — the mock server rejects that if the SKU is referenced by an
 * Order (glossary.md — OrderItem snapshots `skuId`; see `order-fixtures.ts`). */
export const SkuInputSchema = z.object({
  id: z.string().optional(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  color: z.string().nullable(),
  size: z.string().nullable(),
});

export const ProductInputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  images: z.array(z.string()),
  categoryId: z.string().min(1),
  gender: GenderSchema,
  skus: z.array(SkuInputSchema).min(1),
});

export type Gender = z.infer<typeof GenderSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CategoryInput = z.infer<typeof CategoryInputSchema>;
export type Sku = z.infer<typeof SkuSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductListRequest = z.infer<typeof ProductListRequestSchema>;
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;
export type ProductDetailResponse = z.infer<typeof ProductDetailResponseSchema>;
export type SkuInput = z.infer<typeof SkuInputSchema>;
export type ProductInput = z.infer<typeof ProductInputSchema>;
