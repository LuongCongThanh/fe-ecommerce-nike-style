import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createCatalogServer } from '@/../e2e/support/catalog-server';

describe('catalog HTTP harness', () => {
  const server = createCatalogServer();
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address();
    if (address === null || typeof address === 'string') throw new Error('Expected an ephemeral TCP address');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error !== undefined && error !== null) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });

  it('serves a pinned-contract product page with stable pagination', async () => {
    const response = await fetch(`${baseUrl}/api/v1/products?page=2&limit=12`);
    const body = (await response.json()) as {
      data: Array<{ id: string; slug: string }>;
      meta: { page: number; total: number; totalPages: number };
    };

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(12);
    expect(body.data[0]).toMatchObject({ id: 'p-13', slug: 'hoodie-pullover' });
    expect(body.meta).toEqual({ page: 2, limit: 12, total: 24, totalPages: 2 });
  });

  it('serves category, detail, and not-found responses from the same fixture', async () => {
    const categoriesResponse = await fetch(`${baseUrl}/api/v1/categories`);
    const categories = (await categoriesResponse.json()) as Array<{
      name: string;
      children: Array<{ slug: string }>;
    }>;
    const detailResponse = await fetch(`${baseUrl}/api/v1/products/slug/running-shoe-alpha`);
    const detail = (await detailResponse.json()) as { id: string; variants: Array<{ sku: string }> };
    const missingResponse = await fetch(`${baseUrl}/api/v1/products/slug/does-not-exist`);

    expect(categories).toContainEqual(
      expect.objectContaining({ name: 'Shoes', children: expect.arrayContaining([expect.objectContaining({ slug: 'running' })]) }),
    );
    expect(detailResponse.status).toBe(200);
    expect(detail.id).toBe('p-1');
    expect(detail.variants).toContainEqual(expect.objectContaining({ sku: 'RUN-BLACK-39' }));
    expect(missingResponse.status).toBe(404);
  });

  it('supports empty and failed responses and records safe request metadata', async () => {
    const requestId = 'catalog-harness-test';
    const emptyResponse = await fetch(`${baseUrl}/api/v1/products?scenario=empty`, {
      headers: { 'x-e2e-request-id': requestId },
    });
    const failedResponse = await fetch(`${baseUrl}/api/v1/products?scenario=server-error`, {
      headers: { 'x-e2e-request-id': requestId },
    });
    const recordsResponse = await fetch(`${baseUrl}/__test/requests?requestId=${requestId}`);
    const records = (await recordsResponse.json()) as Array<{
      method: string;
      path: string;
      query: Record<string, string>;
      requestId: string;
      hasAuthorization: boolean;
      hasCookie: boolean;
    }>;

    expect(emptyResponse.status).toBe(200);
    await expect(emptyResponse.json()).resolves.toMatchObject({ data: [], meta: { total: 0, totalPages: 0 } });
    expect(failedResponse.status).toBe(503);
    expect(records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: 'GET',
          path: '/api/v1/products',
          query: { scenario: 'empty' },
          requestId,
          hasAuthorization: false,
          hasCookie: false,
        }),
      ]),
    );
  });

  it('can delay a response for timeout and abort probes', async () => {
    const startedAt = performance.now();
    const response = await fetch(`${baseUrl}/api/v1/products?scenario=delay&delayMs=25`);

    expect(response.status).toBe(200);
    expect(performance.now() - startedAt).toBeGreaterThanOrEqual(20);
  });
});
