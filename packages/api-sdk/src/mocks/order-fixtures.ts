/**
 * Mock Order backing store for `packages/api-sdk/src/mocks/handlers.ts` — issue #15 (SF-09, read side).
 *
 * Only list/detail (ownership-checked) are backed here — issue #15's own acceptance criteria explicitly
 * allows Order detail to run against placeholder data if the Checkout slice isn't done yet. Place-order
 * (Reservation, idempotency) is issue #16; cancel/return-request state transitions are issue #17. Orders
 * are keyed by owning Customer id so "Customer chỉ xem được Order của chính mình" (glossary.md —
 * Customer) holds by construction — there's no cross-user lookup path at all, not a permission check
 * layered on top of one. Persisted via `sessionStorage`, same pattern as `cart-fixtures.ts`.
 */

import type { StorefrontOrder } from '../endpoints/orders';

type MockOrder = StorefrontOrder & { userId: number };

interface PersistedOrderDb {
  orders: MockOrder[];
}

const STORAGE_KEY = '__mock_order_db__';

function hasSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

function loadPersisted(): PersistedOrderDb | null {
  if (!hasSessionStorage()) return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as PersistedOrderDb;
  } catch {
    return null;
  }
}

const persisted = loadPersisted();

// Seed: demo account (user id 1) has 2 past orders spanning the state machine, so the order-history
// list and an already-DELIVERED detail page both have something real to render out of the box.
const seedOrders: MockOrder[] = persisted?.orders ?? [
  {
    id: 1001,
    code: 'DH1001',
    status: 'DELIVERED',
    payment_method: 'cod',
    payment_status: 'paid',
    items: [{ id: 1, product_name: 'Running Shoe Alpha', variant_name: 'black / 40', image: '', price: 1_200_000, quantity: 1, subtotal: 1_200_000 }],
    subtotal: 1_200_000,
    shipping_fee: 30_000,
    total: 1_230_000,
    address: '123 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    note: '',
    created_at: '2026-07-20T02:00:00.000Z',
    updated_at: '2026-07-25T02:00:00.000Z',
    delivered_at: '2026-07-25T02:00:00.000Z',
    userId: 1,
  },
  {
    id: 1002,
    code: 'DH1002',
    status: 'PENDING',
    payment_method: 'cod',
    payment_status: 'pending',
    items: [{ id: 2, product_name: 'Cap Classic', variant_name: '', image: '', price: 650_000, quantity: 1, subtotal: 650_000 }],
    subtotal: 650_000,
    shipping_fee: 30_000,
    total: 680_000,
    address: '123 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    note: '',
    created_at: '2026-08-01T02:00:00.000Z',
    updated_at: '2026-08-01T02:00:00.000Z',
    delivered_at: null,
    userId: 1,
  },
];

let orders = new Map<number, MockOrder>(seedOrders.map((o) => [o.id, o]));
let nextOrderId = Math.max(0, ...seedOrders.map((o) => o.id)) + 1;

// Idempotency (issue #16): the same `requestKey` retried (double-click, reload, network retry) replays
// the order it already created instead of placing a second one. In-memory only — a retry racing a full
// page reload is out of scope for the mock.
const orderIdByRequestKey = new Map<string, number>();

function persist(): void {
  if (!hasSessionStorage()) return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ orders: Array.from(orders.values()) }));
}

/** All of `userId`'s own orders, newest first — never another Customer's. */
export function getAccountOrders(userId: number): StorefrontOrder[] {
  return Array.from(orders.values())
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(({ userId: _userId, ...order }) => order);
}

/** A single order, but only if it belongs to `userId` — returns `undefined` for both "doesn't exist" and "exists but isn't yours" (no ownership-leaking distinction). */
export function getAccountOrder(userId: number, orderId: number): StorefrontOrder | undefined {
  const order = orders.get(orderId);
  if (order === undefined || order.userId !== userId) return undefined;
  const { userId: _userId, ...rest } = order;
  return rest;
}

export function addAccountOrder(userId: number, order: StorefrontOrder): void {
  orders.set(order.id, { ...order, userId });
  persist();
}

export function allocateOrderId(): number {
  const id = nextOrderId;
  nextOrderId += 1;
  return id;
}

/** Replays the order already created for `requestKey`, if any — the idempotency check for Place Order. */
export function getOrderByRequestKey(userId: number, requestKey: string): StorefrontOrder | undefined {
  const orderId = orderIdByRequestKey.get(requestKey);
  return orderId === undefined ? undefined : getAccountOrder(userId, orderId);
}

export function recordRequestKey(requestKey: string, orderId: number): void {
  orderIdByRequestKey.set(requestKey, orderId);
}

/** Test-only — resets the mock "DB" (orders + idempotency keys + id counter) back to its seed state between FE-INT tests. */
export function resetMockOrderDbForTesting(): void {
  orders = new Map<number, MockOrder>(seedOrders.map((o) => [o.id, { ...o }]));
  nextOrderId = Math.max(0, ...seedOrders.map((o) => o.id)) + 1;
  orderIdByRequestKey.clear();
  if (hasSessionStorage()) sessionStorage.removeItem(STORAGE_KEY);
}
