'use client';

import { useQueryClient } from '@tanstack/react-query';

import { deleteAddress } from '@/integrations/backend/endpoints/address';
import { addressKeys } from '@/modules/account/addresses/queries/addressKeys';
import { useApiMutation } from '@/shared/queries/useApiMutation';

export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async (id: string) => deleteAddress(id),
    successMessage: 'Đã xoá địa chỉ',
    errorFallback: 'Xoá địa chỉ thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
};
