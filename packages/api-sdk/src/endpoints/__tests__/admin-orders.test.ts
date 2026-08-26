import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetAuthRuntime } from '../../client/fetcher';
import { registerAuthRuntimeAdapter } from '../../client/runtime';
import { resetMockCatalogProductsForTesting } from '../../mocks/catalog-fixtures';
import { resetMockOrderDbForTesting, setOrderStatusForTesting } from '../../mocks/order-fixtures';
import { server } from '../../testing/msw-server';
import { getAdminInventory } from '../admin-inventory';
import { approveAdminOrderReturn, getAdminOrder, getAdminOrders, rejectAdminOrderReturn, updateAdminOrderStatus } from '../admin-orders';
import { loginStaff } from '../staff';

async function loginAsAdminStaff() {
  const { access } = await loginStaff({ email: 'staff@admin.local', password: 'Password123' });
  registerAuthRuntimeAdapter({
    getAccessToken: () => access,
    refreshSession: () => Promise.reject(new Error('not used in this test')),
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  resetMockCatalogProductsForTesting();
  resetMockOrderDbForTesting();
});
afterEach(() => {
  server.resetHandlers();
  resetAuthRuntime();
});
afterAll(() => server.close());

describe('getAdminOrders / getAdminOrder', () => {
  it('resolves every Order regardless of owning Customer', async () => {
    await loginAsAdminStaff();
    const orders = await getAdminOrders();

    expect(orders.some((o) => o.code === 'DH1001')).toBe(true);
    expect(orders.some((o) => o.code === 'DH1002')).toBe(true);
  });

  it('resolves a single Order by id', async () => {
    await loginAsAdminStaff();
    const order = await getAdminOrder(1001);
    expect(order.code).toBe('DH1001');
  });

  it('rejects an unknown id with 404', async () => {
    await loginAsAdminStaff();
    await expect(getAdminOrder(999_999)).rejects.toMatchObject({ status: 404 });
  });

  it('rejects with 401 when there is no Staff session', async () => {
    await expect(getAdminOrders()).rejects.toMatchObject({ status: 401 });
  });
});

describe('updateAdminOrderStatus', () => {
  it('allows PENDING → PROCESSING', async () => {
    await loginAsAdminStaff();
    const updated = await updateAdminOrderStatus(1002, 'PROCESSING');
    expect(updated.status).toBe('PROCESSING');
  });

  it('allows PROCESSING → PACKED → SHIPPED → DELIVERED in sequence', async () => {
    await loginAsAdminStaff();
    await updateAdminOrderStatus(1002, 'PROCESSING');
    await updateAdminOrderStatus(1002, 'PACKED');
    await updateAdminOrderStatus(1002, 'SHIPPED');
    const delivered = await updateAdminOrderStatus(1002, 'DELIVERED');
    expect(delivered.status).toBe('DELIVERED');
    expect(delivered.delivered_at).not.toBeNull();
  });

  it('allows CANCELLED from PENDING', async () => {
    await loginAsAdminStaff();
    const updated = await updateAdminOrderStatus(1002, 'CANCELLED');
    expect(updated.status).toBe('CANCELLED');
  });

  it('refuses skipping a step, e.g. PENDING → SHIPPED, with a 400', async () => {
    await loginAsAdminStaff();
    await expect(updateAdminOrderStatus(1002, 'SHIPPED')).rejects.toMatchObject({ status: 400 });
  });

  it('refuses CANCELLED once the order has reached PACKED, with a 400', async () => {
    await loginAsAdminStaff();
    setOrderStatusForTesting(1002, 'PACKED');
    await expect(updateAdminOrderStatus(1002, 'CANCELLED')).rejects.toMatchObject({ status: 400 });
  });

  it('refuses an unknown order id with a 404', async () => {
    await loginAsAdminStaff();
    await expect(updateAdminOrderStatus(999_999, 'PROCESSING')).rejects.toMatchObject({ status: 404 });
  });
});

describe('approveAdminOrderReturn', () => {
  it('moves RETURN_REQUESTED → RETURNED and releases the SKU stock back to available', async () => {
    await loginAsAdminStaff();
    setOrderStatusForTesting(1001, 'RETURN_REQUESTED', '2026-08-01T00:00:00.000Z');

    const before = await getAdminInventory();
    const beforeOnHand = before.data.find((r) => r.skuId === 'p-1-0-1')?.onHand ?? 0;

    const updated = await approveAdminOrderReturn(1001);
    expect(updated.status).toBe('RETURNED');

    const after = await getAdminInventory();
    const afterOnHand = after.data.find((r) => r.skuId === 'p-1-0-1')?.onHand ?? 0;
    expect(afterOnHand).toBe(beforeOnHand + 1);
  });

  it('refuses approving an Order that is not RETURN_REQUESTED, with a 400', async () => {
    await loginAsAdminStaff();
    await expect(approveAdminOrderReturn(1001)).rejects.toMatchObject({ status: 400 });
  });
});

describe('rejectAdminOrderReturn', () => {
  it('moves RETURN_REQUESTED back to DELIVERED without changing SKU stock', async () => {
    await loginAsAdminStaff();
    setOrderStatusForTesting(1001, 'RETURN_REQUESTED', '2026-08-01T00:00:00.000Z');

    const before = await getAdminInventory();
    const beforeOnHand = before.data.find((r) => r.skuId === 'p-1-0-1')?.onHand ?? 0;

    const updated = await rejectAdminOrderReturn(1001);
    expect(updated.status).toBe('DELIVERED');

    const after = await getAdminInventory();
    const afterOnHand = after.data.find((r) => r.skuId === 'p-1-0-1')?.onHand ?? 0;
    expect(afterOnHand).toBe(beforeOnHand);
  });

  it('refuses rejecting an Order that is not RETURN_REQUESTED, with a 400', async () => {
    await loginAsAdminStaff();
    await expect(rejectAdminOrderReturn(1001)).rejects.toMatchObject({ status: 400 });
  });
});
