'use client';

import { useQueryClient } from '@tanstack/react-query';

import { addressActions } from '@/app/[locale]/(shop)/_lib/api/address';
import { addressKeys } from '@/app/[locale]/(shop)/_lib/hooks/addresses/addressKeys';
import { useApiMutation } from '@/shared/lib/hooks/useApiMutation';

export const useSetDefaultAddress = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async (id: string) => addressActions.setDefault(id),
    successMessage: 'Đã đặt làm địa chỉ mặc định',
    errorFallback: 'Cập nhật thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
};
