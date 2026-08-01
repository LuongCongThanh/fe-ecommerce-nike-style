'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { orderActions } from '@/app/[locale]/(shop)/_lib/api/order';
import { orderKeys } from '@/app/[locale]/(shop)/_lib/hooks/orders/orderKeys';
import { ApiError } from '@/shared/lib/errors/api-error';

export const useCancelOrder = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => orderActions.cancel(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
      await qc.invalidateQueries({ queryKey: orderKeys.list() });
      toast.success('Đã huỷ đơn hàng');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Huỷ đơn hàng thất bại. Vui lòng thử lại.');
    },
  });
};
