import { describe, expect, it } from 'vitest';

import { ProductListRequestSchema, ProductListResponseSchema } from '../catalog';

describe('ProductListRequestSchema', () => {
  it('accepts an optional search term alongside pagination', () => {
    const result = ProductListRequestSchema.safeParse({ page: 1, pageSize: 20, search: 'sneaker' });

    expect(result.success).toBe(true);
  });
});

describe('ProductListResponseSchema', () => {
  it('round-trips a product list response', () => {
    const payload = {
      data: [{ id: '1', slug: 'air-max', name: 'Air Max', price: 129.99 }],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    };

    const result = ProductListResponseSchema.safeParse(payload);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(payload);
  });

  it('rejects a product missing a required field', () => {
    const result = ProductListResponseSchema.safeParse({
      data: [{ id: '1', name: 'Air Max', price: 129.99 }],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });

    expect(result.success).toBe(false);
  });
});
