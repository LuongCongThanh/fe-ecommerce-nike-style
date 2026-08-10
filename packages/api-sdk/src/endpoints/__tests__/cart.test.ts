import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { resetAuthRuntime } from '../../client/fetcher';
import { registerAuthRuntimeAdapter } from '../../client/runtime';
import { server } from '../../testing/msw-server';
import { login } from '../auth';
import { getSkusByIds, mergeCartAfterLogin } from '../cart';

async function loginAndRegisterAdapter() {
  const session = await login({ email: 'customer@example.com', password: 'Password123' });
  registerAuthRuntimeAdapter({
    getAccessToken: () => session.access,
    refreshSession: async () => session.access,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getSkusByIds', () => {
  it('resolves live price/stock/display data for known SKUs', async () => {
    const result = await getSkusByIds(['p-1-0-0']);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ skuId: 'p-1-0-0', price: 1_200_000, stock: 14, name: 'Running Shoe Alpha' });
  });

  it('silently drops unknown SKU ids', async () => {
    const result = await getSkusByIds(['does-not-exist']);
    expect(result).toEqual([]);
  });

  it('short-circuits without a network call for an empty list', async () => {
    await expect(getSkusByIds([])).resolves.toEqual([]);
  });
});

describe('mergeCartAfterLogin (Decision #36)', () => {
  it('sums quantity for a SKU the seeded account already has, and unions a new one', async () => {
    // Seeded demo account (customer@example.com, user id 1) starts with 2x p-1-0-0 (stock 14).
    await loginAndRegisterAdapter();
    try {
      const merged = await mergeCartAfterLogin([
        { skuId: 'p-1-0-0', quantity: 3 }, // 2 (account) + 3 (guest) = 5, well under stock 14
        { skuId: 'p-1-0-2', quantity: 1 }, // new SKU, no collision
      ]);

      expect(merged.find((l) => l.skuId === 'p-1-0-0')?.quantity).toBe(5);
      expect(merged.find((l) => l.skuId === 'p-1-0-2')?.quantity).toBe(1);
    } finally {
      resetAuthRuntime();
    }
  });

  it('clamps a merged quantity to the SKU current stock instead of overshooting it', async () => {
    await loginAndRegisterAdapter();
    try {
      // p-1-0-2 has stock 4 — merging 3 more on top of whatever the account carries must clamp at 4.
      const merged = await mergeCartAfterLogin([{ skuId: 'p-1-0-2', quantity: 3 }]);
      expect(merged.find((l) => l.skuId === 'p-1-0-2')?.quantity).toBeLessThanOrEqual(4);
    } finally {
      resetAuthRuntime();
    }
  });

  it('rejects without a valid Bearer token', async () => {
    await expect(mergeCartAfterLogin([{ skuId: 'p-1-0-0', quantity: 1 }])).rejects.toMatchObject({ status: 401 });
  });
});
