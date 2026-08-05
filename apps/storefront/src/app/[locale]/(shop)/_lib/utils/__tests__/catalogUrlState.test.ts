import { describe, expect, it } from 'vitest';

import { clearCatalogFilters, parseCatalogFilters, withCatalogFilter, withCatalogPage } from '@/app/[locale]/(shop)/_lib/utils/catalogUrlState';

describe('parseCatalogFilters (FE-UNIT-001)', () => {
  it('defaults to sortBy=newest and page=1 when the query string is empty', () => {
    const result = parseCatalogFilters(new URLSearchParams(''));

    expect(result).toEqual({ gender: undefined, sortBy: 'newest', page: 1, minPrice: undefined, maxPrice: undefined });
  });

  it('round-trips a normal query string', () => {
    const result = parseCatalogFilters(new URLSearchParams('gender=women&sortBy=price_asc&page=3&minPrice=100&maxPrice=500'));

    expect(result).toEqual({ gender: 'women', sortBy: 'price_asc', page: 3, minPrice: 100, maxPrice: 500 });
  });

  it('falls back to undefined for an unknown gender value', () => {
    const result = parseCatalogFilters(new URLSearchParams('gender=alien'));

    expect(result.gender).toBeUndefined();
  });

  it('falls back to newest for an unknown sortBy value', () => {
    const result = parseCatalogFilters(new URLSearchParams('sortBy=most_popular'));

    expect(result.sortBy).toBe('newest');
  });

  it('falls back to page 1 for a non-numeric page', () => {
    const result = parseCatalogFilters(new URLSearchParams('page=abc'));

    expect(result.page).toBe(1);
  });

  it('falls back to page 1 for a negative or zero page', () => {
    expect(parseCatalogFilters(new URLSearchParams('page=-5')).page).toBe(1);
    expect(parseCatalogFilters(new URLSearchParams('page=0')).page).toBe(1);
  });

  it('falls back to page 1 for a fractional page', () => {
    expect(parseCatalogFilters(new URLSearchParams('page=1.5')).page).toBe(1);
  });

  it('ignores a negative or non-numeric minPrice/maxPrice', () => {
    const result = parseCatalogFilters(new URLSearchParams('minPrice=-10&maxPrice=abc'));

    expect(result.minPrice).toBeUndefined();
    expect(result.maxPrice).toBeUndefined();
  });
});

describe('withCatalogFilter', () => {
  it('sets a filter and resets page to 1', () => {
    const result = withCatalogFilter(new URLSearchParams('page=4'), 'gender', 'men');

    expect(result.get('gender')).toBe('men');
    expect(result.get('page')).toBe('1');
  });

  it('clears a filter when given undefined and still resets page', () => {
    const result = withCatalogFilter(new URLSearchParams('gender=men&page=4'), 'gender', undefined);

    expect(result.has('gender')).toBe(false);
    expect(result.get('page')).toBe('1');
  });

  it('preserves unrelated query params', () => {
    const result = withCatalogFilter(new URLSearchParams('category=running&page=2'), 'sortBy', 'price_desc');

    expect(result.get('category')).toBe('running');
    expect(result.get('sortBy')).toBe('price_desc');
  });
});

describe('withCatalogPage', () => {
  it('sets the page without touching other filters', () => {
    const result = withCatalogPage(new URLSearchParams('gender=men&sortBy=price_asc'), 3);

    expect(result.get('page')).toBe('3');
    expect(result.get('gender')).toBe('men');
    expect(result.get('sortBy')).toBe('price_asc');
  });
});

describe('clearCatalogFilters', () => {
  it('removes every catalog filter key but keeps unrelated ones', () => {
    const result = clearCatalogFilters(new URLSearchParams('gender=men&sortBy=price_asc&minPrice=1&maxPrice=2&page=3&category=running'));

    expect(result.toString()).toBe('category=running');
  });
});
