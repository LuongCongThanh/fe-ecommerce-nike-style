import { describe, expect, it } from 'vitest';

import { buildProductListQuery, buildSearchQuery, resolveCategoryId, toCategoryData } from '@/modules/catalog/queries/catalogQuery';

describe('catalog query policy', () => {
  it('builds the PLP query with page size 12 and the API gender spelling', () => {
    expect(buildProductListQuery('c1', { gender: 'men', sortBy: 'newest', page: 3, minPrice: 5 }, { size: ['M'], color: [] })).toEqual({
      page: 3,
      limit: 12,
      sort: 'newest',
      categoryId: 'c1',
      gender: ['MEN'],
      size: ['M'],
      color: [],
      minPrice: 5,
      maxPrice: undefined,
    });
  });

  it('scopes search to q, page and newest sort only', () => {
    expect(buildSearchQuery('shoe', 2)).toEqual({ page: 2, limit: 12, sort: 'newest', q: 'shoe' });
  });

  it('resolves slugs through the flat category list', () => {
    const data = toCategoryData([{ id: 'a', slug: 'a', name: 'A', children: [{ id: 'b', slug: 'b', name: 'B', children: [] }] }]);

    expect(resolveCategoryId(data, 'b')).toBe('b');
    expect(resolveCategoryId(data, 'zzz')).toBeUndefined();
    expect(resolveCategoryId(undefined, 'a')).toBeUndefined();
  });
});
