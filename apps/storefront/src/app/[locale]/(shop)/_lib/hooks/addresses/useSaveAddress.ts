'use client';

import type { StorefrontAddressInput } from '@repo/api-sdk/endpoints/address';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { addressActions } from '@/app/[locale]/(shop)/_lib/api/address';
import { addressKeys } from '@/app/[locale]/(shop)/_lib/hooks/addresses/addressKeys';
import { ApiError } from '@/shared/lib/errors/api-error';

/** Create when `id` is absent, update otherwise — one mutation for the add/edit form. */
export const useSaveAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: StorefrontAddressInput }) =>
      id === undefined ? addressActions.create(data) : addressActions.update(id, data),
    onSuccess: async (_result, variables) => {
      await qc.invalidateQueries({ queryKey: addressKeys.list() });
      toast.success(variables.id === undefined ? 'Đã thêm địa chỉ' : 'Đã cập nhật địa chỉ');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Lưu địa chỉ thất bại. Vui lòng thử lại.');
    },
  });
};
