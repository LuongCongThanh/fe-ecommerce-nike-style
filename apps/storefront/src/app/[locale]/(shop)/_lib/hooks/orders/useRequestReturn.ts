'use client';

import { useQueryClient } from '@tanstack/react-query';

import { orderActions } from '@/app/[locale]/(shop)/_lib/api/order';
import { orderKeys } from '@/app/[locale]/(shop)/_lib/hooks/orders/orderKeys';
import { useApiMutation } from '@/shared/lib/hooks/useApiMutation';

export const useRequestReturn = (id: string) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async () => orderActions.requestReturn(id),
    successMessage: 'Đã gửi yêu cầu trả hàng',
    errorFallback: 'Gửi yêu cầu trả hàng thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
      await qc.invalidateQueries({ queryKey: orderKeys.list() });
    },
  });
};
