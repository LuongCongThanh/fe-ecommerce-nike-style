import { InventoryAuditLogResponseSchema, InventoryItemSchema, InventoryListResponseSchema } from '@repo/schemas/inventory';
import type { InventoryAuditLogResponse, InventoryItem, InventoryListResponse, InventoryUpdateInput } from '@repo/schemas/inventory';

import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const ADMIN_INVENTORY_API = {
  LIST: `${API_BASE_URL}/api/admin/inventory/`,
  ITEM: (skuId: string) => `${API_BASE_URL}/api/admin/inventory/${skuId}/`,
  AUDIT_LOG: `${API_BASE_URL}/api/admin/inventory/audit-log/`,
} as const;

/** Admin's Inventory view/update (issue #21) — Staff-only, on top of the same SKU `stock` the
 * catalog owns; `reserved`/`available` are derived, never a second source of truth. */
export async function getAdminInventory(): Promise<InventoryListResponse> {
  return apiClient.get<InventoryListResponse>(ADMIN_INVENTORY_API.LIST, undefined, { schema: InventoryListResponseSchema });
}

export async function updateAdminInventoryOnHand(skuId: string, input: InventoryUpdateInput): Promise<InventoryItem> {
  return apiClient.patch<InventoryItem>(ADMIN_INVENTORY_API.ITEM(skuId), input, { schema: InventoryItemSchema });
}

export async function getAdminInventoryAuditLog(skuId?: string): Promise<InventoryAuditLogResponse> {
  return apiClient.get<InventoryAuditLogResponse>(ADMIN_INVENTORY_API.AUDIT_LOG, skuId === undefined ? undefined : { skuId }, {
    schema: InventoryAuditLogResponseSchema,
  });
}
