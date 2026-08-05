import { describe, expect, it } from 'vitest';

import type { Product } from '@repo/schemas/catalog';

import { getProductPriceRange } from '@/app/[locale]/(shop)/_lib/utils/priceRange';

function product(skus: Product['skus']): Product {
  return {
    id: '1',
    slug: 'p',
    name: 'P',
    description: 'desc',
    images: [],
    categoryId: 'cat-1',
    gender: 'unisex',
    skus,
    rating: 4,
    reviewCount: 1,
  };
}

describe('getProductPriceRange', () => {
  it('is not a range when the Product has a single SKU', () => {
    const result = getProductPriceRange(product([{ id: 'sku-1', price: 100, stock: 5, color: null, size: null }]));

    expect(result).toEqual({ min: 100, max: 100, isRange: false });
  });

  it('is not a range when every SKU shares the same price', () => {
    const result = getProductPriceRange(
      product([
        { id: 'sku-1', price: 100, stock: 5, color: 'black', size: 'm' },
        { id: 'sku-2', price: 100, stock: 3, color: 'black', size: 'l' },
      ]),
    );

    expect(result.isRange).toBe(false);
  });

  it('is a range when SKU prices diverge, min/max reflect the extremes', () => {
    const result = getProductPriceRange(
      product([
        { id: 'sku-1', price: 100, stock: 5, color: 'black', size: 'm' },
        { id: 'sku-2', price: 150, stock: 0, color: 'black', size: 'xl' },
      ]),
    );

    expect(result).toEqual({ min: 100, max: 150, isRange: true });
  });
});
