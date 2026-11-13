'use client';

import { useQueryClient } from '@tanstack/react-query';

import { addressKeys } from '@/features/account/addresses/queries/addressKeys';
import { addressActions } from '@/features/account/addresses/services/address';
import { useApiMutation } from '@/shared/lib/hooks/useApiMutation';

export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async (id: string) => addressActions.remove(id),
    successMessage: 'Đã xoá địa chỉ',
    errorFallback: 'Xoá địa chỉ thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
};
