/**
 * Mock Address-book backing store for `packages/api-sdk/src/mocks/handlers.ts` — issue #15 (SF-09).
 *
 * Keyed by owning Customer id — same "no cross-user lookup path exists" ownership shape as
 * `order-fixtures.ts` and `cart-fixtures.ts`'s account cart. Persisted via `sessionStorage`.
 */

import type { StorefrontAddress, StorefrontAddressInput } from '../endpoints/address';

interface PersistedAddressDb {
  addresses: [number, StorefrontAddress[]][];
}

const STORAGE_KEY = '__mock_address_db__';

function hasSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

function loadPersisted(): PersistedAddressDb | null {
  if (!hasSessionStorage()) return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as PersistedAddressDb;
  } catch {
    return null;
  }
}

const persisted = loadPersisted();

// Seed: demo account (user id 1) starts with one default address, so Checkout/Account both have
// something real to prefill from out of the box.
const SEED_ADDRESSES: StorefrontAddress[] = [
  {
    id: 'addr-1',
    fullName: 'Nguyễn Văn A',
    phone: '0912345678',
    province: 'Hà Nội',
    district: 'Thanh Xuân',
    ward: 'Khương Trung',
    detail: '123 Nguyễn Trãi',
    isDefault: true,
  },
];

let accountAddresses = new Map<number, StorefrontAddress[]>(persisted?.addresses ?? [[1, SEED_ADDRESSES]]);
let nextId = 2;

/** Test-only — resets the mock "DB" back to its seed state between FE-INT tests that mutate it. */
export function resetMockAddressDbForTesting(): void {
  accountAddresses = new Map<number, StorefrontAddress[]>([[1, SEED_ADDRESSES.map((a) => ({ ...a }))]]);
  nextId = 2;
  if (hasSessionStorage()) sessionStorage.removeItem(STORAGE_KEY);
}

function persist(): void {
  if (!hasSessionStorage()) return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ addresses: Array.from(accountAddresses.entries()) }));
}

export function getAddresses(userId: number): StorefrontAddress[] {
  return accountAddresses.get(userId) ?? [];
}

export function createAddress(userId: number, input: StorefrontAddressInput): StorefrontAddress {
  const list = getAddresses(userId);
  const address: StorefrontAddress = { ...input, id: `addr-${String(nextId)}`, isDefault: list.length === 0 || input.isDefault };
  nextId += 1;

  const next = input.isDefault || list.length === 0 ? list.map((a) => ({ ...a, isDefault: false })) : list;
  accountAddresses.set(userId, [...next, address]);
  persist();
  return address;
}

/** Returns `undefined` when `addressId` doesn't exist or isn't `userId`'s — same no-existence-leak shape as `order-fixtures.ts`. */
export function updateAddress(userId: number, addressId: string, input: StorefrontAddressInput): StorefrontAddress | undefined {
  const list = getAddresses(userId);
  if (!list.some((a) => a.id === addressId)) return undefined;

  const makeDefault = input.isDefault;
  const updated = list.map((a) => {
    if (a.id === addressId) return { ...a, ...input, id: addressId };
    return makeDefault ? { ...a, isDefault: false } : a;
  });

  accountAddresses.set(userId, updated);
  persist();
  return updated.find((a) => a.id === addressId);
}

export function deleteAddress(userId: number, addressId: string): boolean {
  const list = getAddresses(userId);
  if (!list.some((a) => a.id === addressId)) return false;

  const wasDefault = list.find((a) => a.id === addressId)?.isDefault === true;
  const remaining = list.filter((a) => a.id !== addressId);
  const firstRemaining = remaining.at(0);
  // Deleting the default address promotes the oldest remaining one, so there's always exactly one
  // default whenever the list is non-empty (mirrors what a real backend constraint would enforce).
  if (wasDefault && firstRemaining !== undefined) {
    remaining[0] = { ...firstRemaining, isDefault: true };
  }

  accountAddresses.set(userId, remaining);
  persist();
  return true;
}

export function setDefaultAddress(userId: number, addressId: string): StorefrontAddress[] | undefined {
  const list = getAddresses(userId);
  if (!list.some((a) => a.id === addressId)) return undefined;

  const updated = list.map((a) => ({ ...a, isDefault: a.id === addressId }));
  accountAddresses.set(userId, updated);
  persist();
  return updated;
}
