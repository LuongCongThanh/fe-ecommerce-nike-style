'use client';

import { useQueryClient } from '@tanstack/react-query';

import { cancelOrder } from '@/integrations/backend/endpoints/orders';
import { orderKeys } from '@/modules/orders/queries/orderKeys';
import { useApiMutation } from '@/shared/queries/useApiMutation';

export const useCancelOrder = (id: string) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async () => cancelOrder(id),
    successMessage: 'Đã huỷ đơn hàng',
    errorFallback: 'Huỷ đơn hàng thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
      await qc.invalidateQueries({ queryKey: orderKeys.list() });
    },
  });
};
