import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ApiError } from '../../client/api-error';
import { server } from '../../testing/msw-server';
import { getCategories, getProduct, getProducts } from '../catalog';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getProducts', () => {
  it('resolves the full mock catalog spread across the Decision #50 category tree', async () => {
    const result = await getProducts({ page: 1, pageSize: 100, sort: 'newest' });

    expect(result.meta.total).toBe(24);
    expect(result.data).toHaveLength(24);
    expect(new Set(result.data.map((p) => p.categoryId)).size).toBe(6);
    expect(new Set(result.data.map((p) => p.gender))).toEqual(new Set(['men', 'women', 'kids', 'unisex']));
  });

  it('sends the search term as a query param and filters by it', async () => {
    const result = await getProducts({ page: 1, pageSize: 50, sort: 'newest', search: 'Running Shoe' });

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.name.includes('Running Shoe'))).toBe(true);
  });

  it('matches a search term missing Vietnamese diacritics against the (accented) product description (issue #11)', async () => {
    const result = await getProducts({ page: 1, pageSize: 50, sort: 'newest', search: 'giay chay bo' });

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.categoryId === 'cat-running')).toBe(true);
  });

  it('tolerates a slight misspelling in the search term (issue #11)', async () => {
    const result = await getProducts({ page: 1, pageSize: 50, sort: 'newest', search: 'Runing Shoe' });

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.name.includes('Running Shoe'))).toBe(true);
  });

  it('returns an empty result set for a search term with no match', async () => {
    const result = await getProducts({ page: 1, pageSize: 50, sort: 'newest', search: 'zzzznotarealproductzzzz' });

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('filters by category slug, including descendants of a top-level category', async () => {
    const result = await getProducts({ page: 1, pageSize: 50, sort: 'newest', category: 'shoes' });

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.categoryId === 'cat-running' || p.categoryId === 'cat-basketball')).toBe(true);
  });

  it('filters by a leaf category slug', async () => {
    const result = await getProducts({ page: 1, pageSize: 50, sort: 'newest', category: 'running' });

    expect(result.data.every((p) => p.categoryId === 'cat-running')).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('filters by gender', async () => {
    const result = await getProducts({ page: 1, pageSize: 50, sort: 'newest', gender: 'kids' });

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.gender === 'kids')).toBe(true);
  });

  it('sorts by price ascending using the minimum SKU price', async () => {
    const result = await getProducts({ page: 1, pageSize: 50, sort: 'price_asc' });

    const minPrices = result.data.map((p) => Math.min(...p.skus.map((sku) => sku.price)));
    const sorted = [...minPrices].sort((a, b) => a - b);
    expect(minPrices).toEqual(sorted);
  });

  it('paginates using page/pageSize', async () => {
    const pageOne = await getProducts({ page: 1, pageSize: 5, sort: 'newest' });
    const pageTwo = await getProducts({ page: 2, pageSize: 5, sort: 'newest' });

    expect(pageOne.data).toHaveLength(5);
    expect(pageTwo.data).toHaveLength(5);
    expect(pageOne.data.map((p) => p.id)).not.toEqual(pageTwo.data.map((p) => p.id));
    expect(pageOne.meta.totalPages).toBeGreaterThan(1);
  });
});

describe('getProduct', () => {
  it('resolves a single product by slug, including its SKUs', async () => {
    const result = await getProduct('running-shoe-alpha');

    expect(result.data.slug).toBe('running-shoe-alpha');
    expect(result.data.skus.length).toBeGreaterThan(0);
  });

  it('rejects with a 404 ApiError for an unknown slug', async () => {
    await expect(getProduct('does-not-exist')).rejects.toThrow(ApiError);
    await expect(getProduct('does-not-exist')).rejects.toMatchObject({ status: 404 });
  });
});

describe('getCategories', () => {
  it('resolves the Decision #50 category tree — 3 top-level categories with 2 children each', async () => {
    const result = await getCategories();

    const topLevel = result.data.filter((c) => c.parentId === null);
    expect(topLevel).toHaveLength(3);

    for (const top of topLevel) {
      const children = result.data.filter((c) => c.parentId === top.id);
      expect(children).toHaveLength(2);
    }
  });
});
