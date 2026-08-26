import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetAuthRuntime } from '../../client/fetcher';
import { registerAuthRuntimeAdapter } from '../../client/runtime';
import { resetMockCatalogProductsForTesting } from '../../mocks/catalog-fixtures';
import { resetMockInventoryAuditForTesting } from '../../mocks/inventory-fixtures';
import { resetMockOrderDbForTesting } from '../../mocks/order-fixtures';
import { resetMockReservationsForTesting, createReservation } from '../../mocks/reservation-fixtures';
import { server } from '../../testing/msw-server';
import { getAdminInventory, getAdminInventoryAuditLog, updateAdminInventoryOnHand } from '../admin-inventory';
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
  resetMockReservationsForTesting();
  resetMockInventoryAuditForTesting();
});
afterEach(() => {
  server.resetHandlers();
  resetAuthRuntime();
});
afterAll(() => server.close());

describe('getAdminInventory', () => {
  it('resolves on_hand/reserved/available per SKU', async () => {
    await loginAsAdminStaff();
    const result = await getAdminInventory();

    const row = result.data.find((r) => r.skuId === 'p-1-0-0');
    expect(row).toBeDefined();
    expect(row?.onHand).toBeGreaterThan(0);
    expect(row?.available).toBe((row?.onHand ?? 0) - (row?.reserved ?? 0));
  });

  it('reflects stock held by an active Reservation as `reserved`, subtracted from `available`', async () => {
    await loginAsAdminStaff();
    const before = await getAdminInventory();
    const beforeRow = before.data.find((r) => r.skuId === 'p-1-0-0');
    const onHand = beforeRow?.onHand ?? 0;

    createReservation([{ skuId: 'p-1-0-0', quantity: 2 }]);

    const after = await getAdminInventory();
    const afterRow = after.data.find((r) => r.skuId === 'p-1-0-0');
    expect(afterRow?.reserved).toBe(2);
    expect(afterRow?.available).toBe(onHand - 2);
  });

  it('rejects with 401 when there is no Staff session', async () => {
    await expect(getAdminInventory()).rejects.toMatchObject({ status: 401 });
  });
});

describe('updateAdminInventoryOnHand', () => {
  it('updates a SKU’s on_hand quantity', async () => {
    await loginAsAdminStaff();
    const updated = await updateAdminInventoryOnHand('p-1-0-0', { onHand: 99 });

    expect(updated.onHand).toBe(99);

    const listed = await getAdminInventory();
    expect(listed.data.find((r) => r.skuId === 'p-1-0-0')?.onHand).toBe(99);
  });

  it('rejects an unknown SKU id with 404', async () => {
    await loginAsAdminStaff();
    await expect(updateAdminInventoryOnHand('nonexistent-sku', { onHand: 10 })).rejects.toMatchObject({ status: 404 });
  });

  it('records an audit-log entry with the actor and the before/after on_hand values', async () => {
    await loginAsAdminStaff();
    await updateAdminInventoryOnHand('p-1-0-0', { onHand: 42 });

    const log = await getAdminInventoryAuditLog('p-1-0-0');
    expect(log.data).toHaveLength(1);
    expect(log.data[0]).toMatchObject({ skuId: 'p-1-0-0', newOnHand: 42, actorName: 'Admin Staff' });
  });
});

describe('getAdminInventoryAuditLog', () => {
  it('lists every audit entry across SKUs when no filter is given', async () => {
    await loginAsAdminStaff();
    await updateAdminInventoryOnHand('p-1-0-0', { onHand: 5 });
    await updateAdminInventoryOnHand('p-2-0-0', { onHand: 7 });

    const log = await getAdminInventoryAuditLog();
    expect(log.data.length).toBeGreaterThanOrEqual(2);
  });
});
