'use client';

import { useQueryClient } from '@tanstack/react-query';

import { addressKeys } from '@/features/account/addresses/queries/addressKeys';
import { addressActions } from '@/features/account/addresses/services/address';
import type { StorefrontAddressInput } from '@/lib/api/endpoints/address';
import { useApiMutation } from '@/shared/lib/hooks/useApiMutation';

/** Create when `id` is absent, update otherwise — one mutation for the add/edit form. */
export const useSaveAddress = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async ({ id, data }: { id?: string; data: StorefrontAddressInput }) =>
      id === undefined ? addressActions.create(data) : addressActions.update(id, data),
    successMessage: (_result, variables) => (variables.id === undefined ? 'Đã thêm địa chỉ' : 'Đã cập nhật địa chỉ'),
    errorFallback: 'Lưu địa chỉ thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
};
