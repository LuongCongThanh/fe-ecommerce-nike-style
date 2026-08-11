'use client';

import { notify } from '@repo/shared/notification';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addressActions } from '@/app/[locale]/(shop)/_lib/api/address';
import { addressKeys } from '@/app/[locale]/(shop)/_lib/hooks/addresses/addressKeys';
import { ApiError } from '@/shared/lib/errors/api-error';

export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => addressActions.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: addressKeys.list() });
      notify.success('Đã xoá địa chỉ');
    },
    onError: (error) => {
      notify.error(error instanceof ApiError ? error.message : 'Xoá địa chỉ thất bại. Vui lòng thử lại.');
    },
  });
};
