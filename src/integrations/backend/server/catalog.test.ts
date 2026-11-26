// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/integrations/backend/client/api-error';
import {
  getCategoryTreeServer,
  getColorsServer,
  getProductBySlugServer,
  getProductsServer,
  getSizesServer,
} from '@/integrations/backend/server/catalog';
import { SERVER_REQUEST_TIMEOUT_MS, serverApiOrigin } from '@/integrations/backend/server/http';

vi.mock('server-only', () => ({}));

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv('API_ORIGIN', 'http://backend.test:9000/');
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
});

function lastCall(): { url: string; init: RequestInit } {
  const [url, init] = fetchMock.mock.calls.at(-1) ?? [];
  return { url: String(url), init: init ?? {} };
}

describe('server public catalog reader', () => {
  it('reads API_ORIGIN, defaulting to the local Backend', () => {
    expect(serverApiOrigin()).toBe('http://backend.test:9000');
    vi.stubEnv('API_ORIGIN', '');
    expect(serverApiOrigin()).toBe('http://localhost:8080');
  });

  it('calls the Backend directly with the list params and maps the page', async () => {
    fetchMock.mockResolvedValue(
      json({
        data: [{ id: 'p1', slug: 's', name: 'N', gender: 'MEN', imageUrl: null, minPrice: 1, maxPrice: 2 }],
        meta: { page: 1, total: 1, totalPages: 1 },
      }),
    );

    const page = await getProductsServer({ page: 1, limit: 12, size: ['M', 'L'], categoryId: undefined });

    expect(lastCall().url).toBe('http://backend.test:9000/api/v1/products?page=1&limit=12&size=M&size=L');
    expect(page.data[0]?.slug).toBe('s');
    expect(page.meta).toEqual({ page: 1, total: 1, totalPages: 1 });
  });

  it('is anonymous, uncached and bounded by a timeout', async () => {
    fetchMock.mockResolvedValue(json([]));

    await getSizesServer();

    const { init } = lastCall();
    expect(init.cache).toBe('no-store');
    expect(init.credentials).toBe('omit');
    expect(init.method).toBe('GET');
    expect(Object.keys((init.headers ?? {}) as Record<string, string>).map((key) => key.toLowerCase())).toEqual(['accept']);
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(SERVER_REQUEST_TIMEOUT_MS).toBe(5000);
  });

  it('maps categories, sizes, colors and a product by encoded slug', async () => {
    fetchMock.mockResolvedValueOnce(json([{ id: 'c', slug: 'shoes', name: 'Shoes', children: [] }]));
    fetchMock.mockResolvedValueOnce(json([{ id: 's', code: 'M', name: 'Medium', sortOrder: 1 }]));
    fetchMock.mockResolvedValueOnce(json([{ id: 'w', code: 'WHT', name: 'White', hex: '#fff' }]));
    fetchMock.mockResolvedValueOnce(
      json({ id: 'p', slug: 'a b', name: 'N', description: null, categoryId: 'c', gender: 'MEN', variants: [], images: [] }),
    );

    expect((await getCategoryTreeServer())[0]?.slug).toBe('shoes');
    expect(await getSizesServer()).toEqual([{ id: 's', code: 'M', name: 'Medium' }]);
    expect(await getColorsServer()).toEqual([{ id: 'w', code: 'WHT', name: 'White', hex: '#fff' }]);
    expect((await getProductBySlugServer('a b')).description).toBe('');
    expect(lastCall().url).toBe('http://backend.test:9000/api/v1/products/slug/a%20b');
  });

  it('throws ApiError with the Backend status and code on a non-2xx response', async () => {
    fetchMock.mockResolvedValue(json({ error: { code: 'PRODUCT_NOT_FOUND', message: 'nope' } }, 404));

    await expect(getProductBySlugServer('x')).rejects.toMatchObject({ name: 'ApiError', status: 404, code: 'PRODUCT_NOT_FOUND' });
  });

  it('turns a timeout, a network failure and a bad body into ApiError without retrying', async () => {
    fetchMock.mockRejectedValueOnce(Object.assign(new Error('t'), { name: 'TimeoutError' }));
    await expect(getSizesServer()).rejects.toMatchObject({ status: 0, code: 'REQUEST_TIMEOUT' });

    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    await expect(getSizesServer()).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });

    fetchMock.mockResolvedValueOnce(new Response('<html>', { status: 200 }));
    const error = await getSizesServer().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'INVALID_RESPONSE' });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
