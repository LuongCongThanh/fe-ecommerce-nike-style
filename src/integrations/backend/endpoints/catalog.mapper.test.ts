import { describe, expect, it } from 'vitest';

import { toCategory, toColors, toDetail, toProductListParams, toProductPage, toSizes } from '@/integrations/backend/endpoints/catalog.mapper';
import type { components } from '@/integrations/backend/generated/openapi';

type Schemas = components['schemas'];

describe('catalog mappers', () => {
  it('maps a paginated list to summaries and meta only', () => {
    const page = toProductPage({
      data: [{ id: 'p1', slug: 's', name: 'N', gender: 'MEN', imageUrl: null, minPrice: 1, maxPrice: 2, extra: 'x' }],
      meta: { page: 2, total: 30, totalPages: 3, limit: 12 },
    } as unknown as Schemas['PaginatedProductListResponseDto']);

    expect(page).toEqual({
      data: [{ id: 'p1', slug: 's', name: 'N', gender: 'MEN', imageUrl: null, minPrice: 1, maxPrice: 2 }],
      meta: { page: 2, total: 30, totalPages: 3 },
    });
  });

  it('maps the category tree recursively', () => {
    const tree = toCategory({
      id: 'a',
      slug: 'a',
      name: 'A',
      children: [{ id: 'b', slug: 'b', name: 'B', children: [] }],
    } as unknown as Schemas['CategoryTreeNodeDto']);

    expect(tree.children[0]?.slug).toBe('b');
  });

  it('keeps only code/name/hex fields of sizes and colors', () => {
    expect(toSizes([{ id: '1', code: 'M', name: 'Medium', sortOrder: 2 }] as unknown as Array<Schemas['SizeResponseDto']>)).toEqual([
      { id: '1', code: 'M', name: 'Medium' },
    ]);
    expect(toColors([{ id: '1', code: 'WHT', name: 'White', hex: '#fff', sortOrder: 1 }] as unknown as Array<Schemas['ColorResponseDto']>)).toEqual([
      { id: '1', code: 'WHT', name: 'White', hex: '#fff' },
    ]);
  });

  it('defaults a null description and drops images without a url', () => {
    const detail = toDetail({
      id: 'p',
      slug: 's',
      name: 'N',
      description: null,
      categoryId: 'c',
      gender: 'UNISEX',
      variants: [],
      images: [
        { id: 'i1', url: null, colorId: 'c1', isPrimary: true, altText: null },
        { id: 'i2', url: 'https://x/y.png', colorId: 'c1', isPrimary: false, altText: 'alt' },
      ],
    } as unknown as Schemas['ProductDetailResponseDto']);

    expect(detail.description).toBe('');
    expect(detail.images.map((image) => image.id)).toEqual(['i2']);
  });

  it('builds list params from a ProductQuery', () => {
    expect(toProductListParams({ page: 1, size: ['M'] })).toMatchObject({ page: 1, size: ['M'], q: undefined });
  });
});
