import { describe, expect, it } from 'vitest';

import {
  buildProductListQuery,
  buildRelatedQuery,
  buildSearchQuery,
  RELATED_LIMIT,
  resolveCategoryId,
  selectRelated,
  toCategoryData,
} from '@/modules/catalog/queries/catalogQuery';

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

describe('related products policy', () => {
  const summary = (slug: string) => ({ id: slug, slug, name: slug, gender: 'MEN' as const, imageUrl: null, minPrice: 1, maxPrice: 1 });

  it('asks for one extra row in the same Category, newest first', () => {
    expect(buildRelatedQuery('c1')).toEqual({ categoryId: 'c1', limit: RELATED_LIMIT + 1, sort: 'newest' });
  });

  it('drops the current Product and keeps at most four', () => {
    const page = { data: ['a', 'me', 'b', 'c', 'd', 'e'].map(summary), meta: { page: 1, total: 6, totalPages: 1 } };
    expect(selectRelated(page, 'me').map((p) => p.slug)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('is empty before the page has loaded', () => {
    expect(selectRelated(undefined, 'me')).toEqual([]);
  });
});
