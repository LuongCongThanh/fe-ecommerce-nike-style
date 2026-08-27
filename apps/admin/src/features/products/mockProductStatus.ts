/**
 * DEMO DATA — `Product` (packages/schemas/src/catalog/catalog.ts) has no publish-status field, and no
 * such field is planned; there's nothing real to bind a "Select Status" filter to. Per explicit
 * request, this derives a **deterministic, fake** status per product (same product id always maps to
 * the same status, so the UI doesn't flicker between renders) purely so the filter control has
 * something to filter — it is NOT backed by any API field and must not be read as real inventory/
 * publish state. Do not wire this into anything that persists or is treated as authoritative.
 */
export const MOCK_PRODUCT_STATUSES = ['published', 'scheduled', 'inactive'] as const;
export type MockProductStatus = (typeof MOCK_PRODUCT_STATUSES)[number];

export function mockProductStatus(productId: string): MockProductStatus {
  let hash = 0;
  for (let i = 0; i < productId.length; i += 1) {
    hash = (hash * 31 + productId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % MOCK_PRODUCT_STATUSES.length;
  return MOCK_PRODUCT_STATUSES.at(index) ?? 'published';
}
