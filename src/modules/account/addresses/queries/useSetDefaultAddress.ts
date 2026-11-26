'use client';

import { useQueryClient } from '@tanstack/react-query';

import { setDefaultAddress } from '@/integrations/backend/endpoints/address';
import { addressKeys } from '@/modules/account/addresses/queries/addressKeys';
import { useApiMutation } from '@/shared/queries/useApiMutation';

export const useSetDefaultAddress = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async (id: string) => setDefaultAddress(id),
    successMessage: 'Đã đặt làm địa chỉ mặc định',
    errorFallback: 'Cập nhật thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
};
