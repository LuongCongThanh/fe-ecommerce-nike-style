import { updateAdminInventoryOnHand } from '@repo/api-sdk/endpoints/admin-inventory';
import type { InventoryUpdateInput } from '@repo/schemas/inventory';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminInventoryKeys } from './useAdminInventory';

export function useUpdateInventoryOnHand(skuId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InventoryUpdateInput) => updateAdminInventoryOnHand(skuId, input),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: adminInventoryKeys.list }),
        qc.invalidateQueries({ queryKey: adminInventoryKeys.auditLog(skuId) }),
        qc.invalidateQueries({ queryKey: adminInventoryKeys.auditLog(undefined) }),
      ]);
    },
  });
}
