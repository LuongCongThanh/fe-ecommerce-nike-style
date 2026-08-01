import { z } from 'zod';

import type { ProductFilter as SharedProductFilter } from '@/shared/types/filter';

export type BadgeValue = 'best-seller' | 'new' | 'sale' | 'low-stock';

export const ProductVariantSchema = z.object({
  id: z.number(),
  size: z.string().nullable(),
  color: z.string().nullable(),
  stock: z.number().int().nonnegative(),
  price: z.number(),
  sku: z.string().optional(),
});

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number(),
  salePrice: z.number().nullable(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string()),
  category: z.object({ id: z.number(), name: z.string(), slug: z.string() }),
  variants: z.array(ProductVariantSchema).optional(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const ProductListSchema = z.object({
  results: z.array(ProductSchema),
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductList = z.infer<typeof ProductListSchema>;

export type ProductFilters = SharedProductFilter;
