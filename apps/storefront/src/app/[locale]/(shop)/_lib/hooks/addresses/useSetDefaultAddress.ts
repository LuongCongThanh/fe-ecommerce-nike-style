'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { addressActions } from '@/app/[locale]/(shop)/_lib/api/address';
import { addressKeys } from '@/app/[locale]/(shop)/_lib/hooks/addresses/addressKeys';
import { ApiError } from '@/shared/lib/errors/api-error';

export const useSetDefaultAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => addressActions.setDefault(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: addressKeys.list() });
      toast.success('Đã đặt làm địa chỉ mặc định');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Cập nhật thất bại. Vui lòng thử lại.');
    },
  });
};
