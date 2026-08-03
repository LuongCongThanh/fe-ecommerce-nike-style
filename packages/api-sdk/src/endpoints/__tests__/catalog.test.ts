import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { server } from '../../testing/msw-server';
import { getProducts } from '../catalog';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getProducts', () => {
  it('resolves a parsed product list from the mock handler', async () => {
    const result = await getProducts();

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toMatchObject({ slug: 'air-max-90' });
    expect(result.meta.total).toBe(2);
  });

  it('sends the search term as a query param', async () => {
    const result = await getProducts({ page: 1, pageSize: 20, search: 'air' });

    expect(result.data.length).toBeGreaterThan(0);
  });
});
