'use client';

import { useQueryClient } from '@tanstack/react-query';

import { orderKeys } from '@/features/orders/queries/orderKeys';
import { orderActions } from '@/features/orders/services/order';
import { useApiMutation } from '@/shared/lib/hooks/useApiMutation';

export const useCancelOrder = (id: string) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async () => orderActions.cancel(id),
    successMessage: 'Đã huỷ đơn hàng',
    errorFallback: 'Huỷ đơn hàng thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
      await qc.invalidateQueries({ queryKey: orderKeys.list() });
    },
  });
};
