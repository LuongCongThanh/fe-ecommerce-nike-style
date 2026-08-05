import { describe, expect, it } from 'vitest';

import { CatalogErrorSchema, CategoryListResponseSchema, ProductListRequestSchema, ProductListResponseSchema, ProductSchema } from '../catalog';

const validSku = { id: 'sku-1', price: 129.99, color: null, size: null };
const validProduct = {
  id: '1',
  slug: 'air-max',
  name: 'Air Max',
  images: ['/air-max.jpg'],
  categoryId: 'cat-running',
  gender: 'unisex' as const,
  skus: [validSku],
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

  it('accepts multiple SKUs with diverging prices (Color x Size Variant)', () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      skus: [
        { id: 'sku-1', price: 100, color: 'black', size: 'm' },
        { id: 'sku-2', price: 120, color: 'black', size: 'l' },
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

describe('CatalogErrorSchema', () => {
  it('is the shared error envelope, re-exported for this domain', () => {
    const result = CatalogErrorSchema.safeParse({ error: { code: 'NOT_FOUND', message: 'Product not found' } });

    expect(result.success).toBe(true);
  });
});
