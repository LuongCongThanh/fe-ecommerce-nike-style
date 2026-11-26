'use client';

import { useQueryClient } from '@tanstack/react-query';

import { orderKeys } from '@/features/orders/queries/orderKeys';
import { requestReturn } from '@/integrations/backend/endpoints/orders';
import { useApiMutation } from '@/shared/queries/useApiMutation';

export const useRequestReturn = (id: string) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async () => requestReturn(id),
    successMessage: 'Đã gửi yêu cầu trả hàng',
    errorFallback: 'Gửi yêu cầu trả hàng thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
      await qc.invalidateQueries({ queryKey: orderKeys.list() });
    },
  });
};
