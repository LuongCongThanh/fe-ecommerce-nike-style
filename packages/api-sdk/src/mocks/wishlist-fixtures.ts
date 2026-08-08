/**
 * Mock Wishlist backing store for `packages/api-sdk/src/mocks/handlers.ts` — issue #14 (SF-06).
 *
 * WishlistItem is `{productId}` only (glossary.md — no SKU/Variant, no quantity), so "merge sau đăng
 * nhập" is a pure union + dedupe by Product id, not a sum+clamp like Cart. The guest wishlist itself
 * stays entirely client-side (localStorage, `apps/storefront` `useWishlist.ts`); this module only backs
 * the *account* side of the merge — a signed-in user's wishlist as the mock's simulated backend would
 * remember it across sessions. Persisted via `sessionStorage` the same way `cart-fixtures.ts` persists
 * its account carts.
 */

import type { Product } from '@repo/schemas/catalog';

import { mockProducts } from './catalog-fixtures';

/** Resolves each requested Product id against the live catalog — unknown ids are silently dropped (Product no longer exists), mirroring `cart-fixtures.ts`'s `resolveSkus`. */
export function resolveProducts(productIds: string[]): Product[] {
  const resolved: Product[] = [];
  for (const productId of productIds) {
    const product = mockProducts.find((p) => p.id === productId);
    if (product !== undefined) resolved.push(product);
  }
  return resolved;
}

interface PersistedWishlistDb {
  accountWishlists: [number, string[]][];
}

const STORAGE_KEY = '__mock_wishlist_db__';

function hasSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

function loadPersisted(): PersistedWishlistDb | null {
  if (!hasSessionStorage()) return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as PersistedWishlistDb;
  } catch {
    return null;
  }
}

const persisted = loadPersisted();

// Seed: demo account (user id 1) starts with an empty wishlist — unlike Cart there's no quantity to
// demo-sum against, a plain guest→account union is enough to exercise the merge.
const accountWishlists = new Map<number, string[]>(persisted?.accountWishlists ?? [[1, []]]);

function persist(): void {
  if (!hasSessionStorage()) return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ accountWishlists: Array.from(accountWishlists.entries()) }));
}

export function getAccountWishlist(userId: number): string[] {
  return accountWishlists.get(userId) ?? [];
}

/**
 * Merges `incomingProductIds` (the guest wishlist) into the account's stored wishlist: pure union +
 * dedupe by Product id — no quantity, no clamp, no "conflict" concept (glossary.md — Merge Wishlist).
 * Saves and returns the merged result.
 */
export function mergeAccountWishlist(userId: number, incomingProductIds: string[]): string[] {
  const existing = getAccountWishlist(userId);
  const merged = Array.from(new Set([...existing, ...incomingProductIds]));
  accountWishlists.set(userId, merged);
  persist();
  return merged;
}
