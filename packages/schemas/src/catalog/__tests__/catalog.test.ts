import { describe, expect, it } from 'vitest';

import {
  CategoryListResponseSchema,
  ProductDetailResponseSchema,
  ProductListRequestSchema,
  ProductListResponseSchema,
  ProductSchema,
} from '../catalog';

const validSku = { id: 'sku-1', price: 129.99, stock: 10, color: null, size: null };
const validProduct = {
  id: '1',
  slug: 'air-max',
  name: 'Air Max',
  description: 'A classic sneaker.',
  images: ['/air-max.jpg'],
  categoryId: 'cat-running',
  gender: 'unisex' as const,
  skus: [validSku],
  rating: 4.5,
  reviewCount: 10,
};

describe('ProductSchema', () => {
  it('accepts a product with at least one SKU and a gender', () => {
    const result = ProductSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
  });

  it('rejects a product with no SKUs (every Product maps to >=1 SKU, even without a Variant)', () => {
    const result = ProductSchema.safeParse({ ...validProduct, skus: [] });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid gender', () => {
    const result = ProductSchema.safeParse({ ...validProduct, gender: 'other' });

    expect(result.success).toBe(false);
  });

  it('rejects a SKU with a negative stock', () => {
    const result = ProductSchema.safeParse({ ...validProduct, skus: [{ ...validSku, stock: -1 }] });

    expect(result.success).toBe(false);
  });

  it('accepts multiple SKUs with diverging prices and stock (Color x Size Variant)', () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      skus: [
        { id: 'sku-1', price: 100, stock: 5, color: 'black', size: 'm' },
        { id: 'sku-2', price: 120, stock: 0, color: 'black', size: 'l' },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe('ProductListRequestSchema', () => {
  it('accepts an optional search term alongside pagination', () => {
    const result = ProductListRequestSchema.safeParse({ page: 1, pageSize: 20, search: 'sneaker' });

    expect(result.success).toBe(true);
  });

  it('accepts category, gender, price range, and sort filters', () => {
    const result = ProductListRequestSchema.safeParse({
      page: 1,
      pageSize: 20,
      category: 'running',
      gender: 'men',
      minPrice: 100,
      maxPrice: 500,
      sort: 'price_asc',
    });

    expect(result.success).toBe(true);
  });

  it('defaults sort to newest when omitted', () => {
    const result = ProductListRequestSchema.parse({ page: 1, pageSize: 20 });

    expect(result.sort).toBe('newest');
  });

  it('rejects an invalid gender filter', () => {
    const result = ProductListRequestSchema.safeParse({ page: 1, pageSize: 20, gender: 'other' });

    expect(result.success).toBe(false);
  });
});

describe('ProductListResponseSchema', () => {
  it('round-trips a product list response', () => {
    const payload = {
      data: [validProduct],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    };

    const result = ProductListResponseSchema.safeParse(payload);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(payload);
  });

  it('rejects a product missing a required field', () => {
    const result = ProductListResponseSchema.safeParse({
      data: [{ id: '1', name: 'Air Max', skus: [validSku] }],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });

    expect(result.success).toBe(false);
  });
});

describe('ProductDetailResponseSchema', () => {
  it('round-trips a single product response', () => {
    const result = ProductDetailResponseSchema.safeParse({ data: validProduct });

    expect(result.success).toBe(true);
  });
});

describe('CategoryListResponseSchema', () => {
  it('accepts a flat category list with nullable parentId', () => {
    const result = CategoryListResponseSchema.safeParse({
      data: [
        { id: 'cat-shoes', slug: 'shoes', name: 'Shoes', parentId: null },
        { id: 'cat-running', slug: 'running', name: 'Running', parentId: 'cat-shoes' },
      ],
    });

    expect(result.success).toBe(true);
  });
});
