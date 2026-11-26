// @vitest-environment node
import { hydrate, QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';
import { HOME_NEW_ARRIVALS_QUERY } from '@/modules/catalog/queries/catalogQuery';
import { prefetchHome } from '@/modules/catalog/server/prefetchCatalog';

vi.mock('server-only', () => ({}));

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const tree = [{ id: 'cat-shoes', slug: 'shoes', name: 'Shoes', children: [] }];
const productPage = {
  data: [{ id: 'p1', slug: 's', name: 'N', gender: 'MEN', imageUrl: null, minPrice: 1, maxPrice: 2 }],
  meta: { page: 1, total: 1, totalPages: 1 },
};

const fetchMock = vi.fn<typeof fetch>();

function backend(overrides: { categories?: Response | Error; products?: Response | Error } = {}): void {
  fetchMock.mockImplementation(async (input) => {
    const { pathname } = new URL(String(input));
    const answer = (value: Response | Error | undefined, fallback: Response): Response => {
      if (value instanceof Error) throw value;
      return value?.clone() ?? fallback;
    };
    if (pathname === '/api/v1/categories') return answer(overrides.categories, json(tree));
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

describe('prefetchHome', () => {
  it('dehydrates the newest five products and the category tree under the hook keys', async () => {
    backend();

    const state = await prefetchHome();

    const client = new QueryClient();
    hydrate(client, state);
    expect(client.getQueryData(catalogKeys.products(HOME_NEW_ARRIVALS_QUERY))).toMatchObject({ meta: { page: 1 } });
    expect(client.getQueryData(catalogKeys.categories())).toMatchObject({ tree: [{ slug: 'shoes' }], flat: [{ id: 'cat-shoes' }] });
    expect(state.queries).toHaveLength(2);
    expect(requested()).toContain('/api/v1/products?limit=5&sort=newest');
  });

  it('keeps the category tree when the product list fails, without retrying', async () => {
    backend({ products: json({ error: { code: 'BOOM', message: 'boom' } }, 503) });

    const state = await prefetchHome();

    expect(state.queries.map((query) => query.queryKey[1])).toEqual(['categories']);
    expect(requested().filter((path) => path.startsWith('/api/v1/products'))).toHaveLength(1);
  });

  it('keeps the products when the tree fails, and never dehydrates the failure', async () => {
    backend({ categories: new TypeError('fetch failed') });

    const state = await prefetchHome();

    expect(state.queries.map((query) => query.queryKey[1])).toEqual(['products']);
    expect(JSON.stringify(state)).not.toContain('fetch failed');
  });

  it('dehydrates nothing when both reads fail, so the sections fetch and show their own error', async () => {
    backend({ categories: new TypeError('fetch failed'), products: new TypeError('fetch failed') });

    await expect(prefetchHome()).resolves.toMatchObject({ queries: [] });
  });

  it('sends no cookie or credential to the Backend', async () => {
    backend();
    await prefetchHome();

    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.credentials).toBe('omit');
      expect(JSON.stringify(init?.headers)).not.toMatch(/cookie|authorization/i);
    }
  });
});
