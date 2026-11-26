// @vitest-environment node
import { hydrate, QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';
import { buildProductListQuery, buildRelatedQuery } from '@/modules/catalog/queries/catalogQuery';
import { createCatalogPrefetcher, prefetchProductDetail, prefetchProductsListing } from '@/modules/catalog/server/prefetchCatalog';

vi.mock('server-only', () => ({}));

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const tree = [{ id: 'cat-shoes', slug: 'shoes', name: 'Shoes', children: [{ id: 'cat-run', slug: 'running', name: 'Running', children: [] }] }];
const productPage = {
  data: [{ id: 'p1', slug: 's', name: 'N', gender: 'MEN', imageUrl: null, minPrice: 1, maxPrice: 2 }],
  meta: { page: 1, total: 1, totalPages: 1 },
};

interface Backend {
  readonly categories?: Response | Error;
  readonly products?: Response | Error;
}

const fetchMock = vi.fn<typeof fetch>();

function backend(overrides: Backend = {}): void {
  fetchMock.mockImplementation(async (input) => {
    const { pathname } = new URL(String(input));
    const answer = (value: Response | Error | undefined, fallback: Response): Response => {
      if (value instanceof Error) throw value;
      return value?.clone() ?? fallback;
    };
    if (pathname === '/api/v1/categories') return answer(overrides.categories, json(tree));
    if (pathname === '/api/v1/sizes') return json([{ id: 's', code: 'M', name: 'Medium' }]);
    if (pathname === '/api/v1/colors') return json([{ id: 'w', code: 'WHT', name: 'White', hex: '#fff' }]);
    if (pathname === '/api/v1/products') return answer(overrides.products, json(productPage));
    return json({ error: { code: 'NOT_FOUND', message: 'x' } }, 404);
  });
}

const requested = (): string[] => fetchMock.mock.calls.map(([input]) => `${new URL(String(input)).pathname}${new URL(String(input)).search}`);

beforeEach(() => {
  vi.stubEnv('API_ORIGIN', 'http://backend.test');
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
});

describe('prefetchProductsListing', () => {
  it('dehydrates categories as {tree, flat}, sizes, colors and the URL product page under the hook keys', async () => {
    backend();

    const state = await prefetchProductsListing(new URLSearchParams('gender=women&sortBy=price_asc&page=2&size=M&size=L&minPrice=10'));

    const client = new QueryClient();
    hydrate(client, state);
    const expectedQuery = buildProductListQuery(
      undefined,
      { gender: 'women', sortBy: 'price_asc', page: 2, minPrice: 10, maxPrice: undefined },
      { size: ['M', 'L'], color: [] },
    );
    expect(client.getQueryData(catalogKeys.products(expectedQuery))).toMatchObject({ meta: { page: 1 } });
    expect(client.getQueryData(catalogKeys.categories())).toMatchObject({
      tree: [{ slug: 'shoes' }],
      flat: [{ id: 'cat-shoes' }, { id: 'cat-run', parentId: 'cat-shoes' }],
    });
    expect(client.getQueryData(catalogKeys.sizes())).toEqual([{ id: 's', code: 'M', name: 'Medium' }]);
    expect(client.getQueryData(catalogKeys.colors())).toEqual([{ id: 'w', code: 'WHT', name: 'White', hex: '#fff' }]);
    expect(requested()).toContain('/api/v1/products?page=2&limit=12&gender=WOMEN&size=M&size=L&minPrice=10&sort=price_asc');
  });

  it('resolves ?category=<slug> through the tree and sends its id', async () => {
    backend();

    await prefetchProductsListing(new URLSearchParams('category=running'));

    expect(requested().find((path) => path.startsWith('/api/v1/products'))).toBe('/api/v1/products?page=1&limit=12&categoryId=cat-run&sort=newest');
  });

  it('fetches no products when the slug is not in the tree', async () => {
    backend();

    const state = await prefetchProductsListing(new URLSearchParams('category=ghost'));

    expect(requested().some((path) => path.startsWith('/api/v1/products'))).toBe(false);
    expect(state.queries.map((query) => query.queryKey[1])).toEqual(expect.arrayContaining(['categories', 'sizes', 'colors']));
    expect(state.queries.some((query) => query.queryKey[1] === 'products')).toBe(false);
  });

  it('fetches no products when the tree failed, and does not dehydrate the failure', async () => {
    backend({ categories: new TypeError('fetch failed') });

    const state = await prefetchProductsListing(new URLSearchParams('category=running'));

    expect(requested().some((path) => path.startsWith('/api/v1/products'))).toBe(false);
    expect(state.queries.some((query) => query.queryKey[1] === 'categories')).toBe(false);
    expect(JSON.stringify(state)).not.toContain('fetch failed');
  });

  it('keeps the successful queries when the product list fails (5xx), without retrying', async () => {
    backend({ products: json({ error: { code: 'BOOM', message: 'boom' } }, 503) });

    const state = await prefetchProductsListing(new URLSearchParams(''));

    expect(state.queries.some((query) => query.queryKey[1] === 'products')).toBe(false);
    expect(state.queries.some((query) => query.queryKey[1] === 'categories')).toBe(true);
    expect(requested().filter((path) => path.startsWith('/api/v1/products'))).toHaveLength(1);
  });

  it('gives each request its own QueryClient', async () => {
    backend();
    const first = await prefetchProductsListing(new URLSearchParams('page=1'));
    backend({ products: json({ ...productPage, meta: { page: 9, total: 99, totalPages: 9 } }) });
    const second = await prefetchProductsListing(new URLSearchParams('page=1'));

    const metas = [first, second].map((state) => state.queries.find((query) => query.queryKey[1] === 'products')?.state.data);
    expect(metas[0]).toMatchObject({ meta: { page: 1 } });
    expect(metas[1]).toMatchObject({ meta: { page: 9 } });
  });

  it('sends no cookie or credential to the Backend', async () => {
    backend();
    await prefetchProductsListing(new URLSearchParams(''));

    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.credentials).toBe('omit');
      expect(JSON.stringify(init?.headers)).not.toMatch(/cookie|authorization/i);
    }
  });

  it('does not refetch a hydrated fresh key in a browser-policy client', async () => {
    backend();
    const state = await prefetchProductsListing(new URLSearchParams(''));
    // Browser root policy (providers/query-client.ts): 60 s default staleTime, the hook's 10 min for categories.
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false } } });
    hydrate(client, state);
    const queryFn = vi.fn();

    await client.prefetchQuery({ queryKey: catalogKeys.categories(), queryFn, staleTime: 10 * 60_000 });

    expect(queryFn).not.toHaveBeenCalled();
  });
});

describe('createCatalogPrefetcher', () => {
  it('stores a product 404 as null and any other failure as no entry', async () => {
    backend();
    const prefetcher = createCatalogPrefetcher();

    expect(await prefetcher.product('missing')).toBeNull();
    expect(prefetcher.dehydrate().queries[0]?.state.data).toBeNull();

    fetchMock.mockResolvedValue(json({ error: { code: 'BOOM', message: 'x' } }, 500));
    const other = createCatalogPrefetcher();
    expect(await other.product('x')).toBeUndefined();
    expect(other.dehydrate().queries).toHaveLength(0);
  });

  it('searches only for a non-empty trimmed q and keys it by the trimmed value', async () => {
    backend();
    const prefetcher = createCatalogPrefetcher();

    expect(await prefetcher.search('   ', 1)).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();

    await prefetcher.search(' shoe ', 2);
    expect(requested()).toEqual(['/api/v1/products?page=2&limit=12&q=shoe&sort=newest']);
    expect(prefetcher.dehydrate().queries[0]?.queryKey).toEqual(catalogKeys.search('shoe', 2));
  });
});

const detailDto = {
  id: 'p1',
  slug: 'air-max',
  name: 'Air Max',
  description: null,
  categoryId: 'cat-run',
  gender: 'MEN',
  variants: [
    {
      id: 'v1',
      sku: 'AM-M-WHT',
      price: 100,
      size: { id: 's', code: 'M', name: 'Medium' },
      color: { id: 'w', code: 'WHT', name: 'White', hex: '#fff' },
    },
  ],
  images: [{ id: 'i1', url: null, colorId: 'w', isPrimary: true, altText: null }],
};

function detailBackend(overrides: { product?: Response | Error; related?: Response | Error } = {}): void {
  fetchMock.mockImplementation(async (input) => {
    const { pathname } = new URL(String(input));
    const answer = (value: Response | Error | undefined, fallback: Response): Response => {
      if (value instanceof Error) throw value;
      return value?.clone() ?? fallback;
    };
    if (pathname === '/api/v1/products/slug/air-max') return answer(overrides.product, json(detailDto));
    if (pathname === '/api/v1/products') return answer(overrides.related, json(productPage));
    return json({ error: { code: 'NOT_FOUND', message: 'x' } }, 404);
  });
}

describe('prefetchProductDetail', () => {
  it('dehydrates the mapped product and its related page under the hook keys', async () => {
    detailBackend();

    const state = await prefetchProductDetail('air-max');

    const client = new QueryClient();
    hydrate(client, state);
    expect(client.getQueryData(catalogKeys.product('air-max'))).toMatchObject({
      id: 'p1',
      description: '',
      categoryId: 'cat-run',
      images: [],
    });
    expect(client.getQueryData(catalogKeys.products(buildRelatedQuery('cat-run')))).toEqual(productPage);
    expect(requested()).toEqual(['/api/v1/products/slug/air-max', '/api/v1/products?limit=5&categoryId=cat-run&sort=newest']);
  });

  it('keeps a 404 as null and reads no related products', async () => {
    detailBackend({ product: json({ error: { code: 'NOT_FOUND', message: 'x' } }, 404) });

    const state = await prefetchProductDetail('air-max');

    expect(state.queries.map((q) => q.state.data)).toEqual([null]);
    expect(requested()).toEqual(['/api/v1/products/slug/air-max']);
  });

  it('leaves the product out on 5xx or network error so the browser retries it', async () => {
    detailBackend({ product: json({ error: { code: 'BOOM', message: 'x' } }, 500) });
    expect((await prefetchProductDetail('air-max')).queries).toHaveLength(0);

    fetchMock.mockReset();
    detailBackend({ product: new TypeError('offline') });
    expect((await prefetchProductDetail('air-max')).queries).toHaveLength(0);
  });

  it('keeps the product when only the related read fails', async () => {
    detailBackend({ related: json({ error: { code: 'BOOM', message: 'x' } }, 500) });

    const state = await prefetchProductDetail('air-max');

    expect(state.queries.map((q) => q.queryKey)).toEqual([catalogKeys.product('air-max')]);
  });
});
