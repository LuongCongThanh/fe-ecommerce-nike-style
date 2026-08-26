'use client';

import { getAdminInventory, getAdminInventoryAuditLog } from '@repo/api-sdk/endpoints/admin-inventory';
import { useQuery } from '@tanstack/react-query';

export const adminInventoryKeys = {
  list: ['admin', 'inventory'] as const,
  auditLog: (skuId?: string) => ['admin', 'inventory', 'audit-log', skuId] as const,
};

export function useAdminInventory() {
  return useQuery({
    queryKey: adminInventoryKeys.list,
    queryFn: getAdminInventory,
  });
}

/** `skuId` scopes the log to one SKU's history; omit to see every entry (issue #21's "audit log hiển thị"). */
export function useAdminInventoryAuditLog(skuId?: string) {
  return useQuery({
    queryKey: adminInventoryKeys.auditLog(skuId),
    queryFn: () => getAdminInventoryAuditLog(skuId),
  });
}
