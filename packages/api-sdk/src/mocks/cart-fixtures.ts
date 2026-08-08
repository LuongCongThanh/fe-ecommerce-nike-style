/**
 * Mock Cart backing store for `packages/api-sdk/src/mocks/handlers.ts` — issue #13 (SF-05).
 *
 * CartItem is `{skuId, quantity}` only (glossary.md), so price/stock are never cached — every read
 * re-resolves against the live SKU in `catalog-fixtures.ts`. The guest cart itself stays entirely
 * client-side (localStorage, `apps/storefront` `useCart.ts`); this module only backs the *account*
 * side of "merge cart sau đăng nhập" (Decision #36) — a signed-in user's cart as the mock's simulated
 * backend would remember it across sessions. Persisted via `sessionStorage` the same way
 * `auth-fixtures.ts` persists its user/token records — a mock "database" concern, not the client's own
 * token storage, so it doesn't touch the ADR-0010 rules that govern auth tokens.
 */

import type { Product, Sku } from '@repo/schemas/catalog';

import { mockProducts } from './catalog-fixtures';

export interface ResolvedSku {
  skuId: string;
  price: number;
  stock: number;
  color: string | null;
  size: string | null;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
}

function toResolvedSku(product: Product, sku: Sku): ResolvedSku {
  return {
    skuId: sku.id,
    price: sku.price,
    stock: sku.stock,
    color: sku.color,
    size: sku.size,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images.at(0) ?? null,
  };
}

/** Resolves each requested SKU id against the live catalog — unknown ids are silently dropped (SKU no longer exists). */
export function resolveSkus(skuIds: string[]): ResolvedSku[] {
  const resolved: ResolvedSku[] = [];
  for (const skuId of skuIds) {
    for (const product of mockProducts) {
      const sku = product.skus.find((s) => s.id === skuId);
      if (sku !== undefined) {
        resolved.push(toResolvedSku(product, sku));
        break;
      }
    }
  }
  return resolved;
}

export function getSkuStock(skuId: string): number {
  return resolveSkus([skuId]).at(0)?.stock ?? 0;
}

export interface RawCartItem {
  skuId: string;
  quantity: number;
}

interface PersistedCartDb {
  accountCarts: [number, RawCartItem[]][];
}

const STORAGE_KEY = '__mock_cart_db__';

function hasSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

function loadPersisted(): PersistedCartDb | null {
  if (!hasSessionStorage()) return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as PersistedCartDb;
  } catch {
    return null;
  }
}

const persisted = loadPersisted();

// Seed: the demo account (`customer@example.com`, user id 1) already has 2x `p-1-0-0` in its cart —
// gives "merge sau đăng nhập" something real to sum against instead of trivially merging into empty.
const accountCarts = new Map<number, RawCartItem[]>(persisted?.accountCarts ?? [[1, [{ skuId: 'p-1-0-0', quantity: 2 }]]]);

function persist(): void {
  if (!hasSessionStorage()) return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ accountCarts: Array.from(accountCarts.entries()) }));
}

export function getAccountCart(userId: number): RawCartItem[] {
  return accountCarts.get(userId) ?? [];
}

/**
 * Merges `incomingItems` (the guest cart) into the account's stored cart: sums quantity per matching
 * SKU (never overwrites, never takes the max), then clamps each line to that SKU's current `available`
 * (Decision #36) — a line that would exceed stock is capped, not dropped or left over-limit. Saves and
 * returns the merged result.
 */
export function mergeAccountCart(userId: number, incomingItems: RawCartItem[]): RawCartItem[] {
  const existing = getAccountCart(userId);
  const quantityBySku = new Map<string, number>();

  for (const item of [...existing, ...incomingItems]) {
    quantityBySku.set(item.skuId, (quantityBySku.get(item.skuId) ?? 0) + item.quantity);
  }

  const merged = Array.from(quantityBySku.entries())
    .map(([skuId, quantity]) => ({ skuId, quantity: Math.min(quantity, getSkuStock(skuId)) }))
    .filter((item) => item.quantity > 0); // SKU sold out entirely — drop rather than keep an invalid 0-quantity line

  accountCarts.set(userId, merged);
  persist();
  return merged;
}
