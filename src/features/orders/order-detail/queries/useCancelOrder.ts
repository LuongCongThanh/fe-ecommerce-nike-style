'use client';

import { useQueryClient } from '@tanstack/react-query';

import { orderKeys } from '@/features/orders/queries/orderKeys';
import { cancelOrder } from '@/lib/api/endpoints/orders';
import { useApiMutation } from '@/shared/lib/hooks/useApiMutation';

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
