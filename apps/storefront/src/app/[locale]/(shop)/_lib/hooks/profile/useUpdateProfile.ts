'use client';

import { useQueryClient } from '@tanstack/react-query';

import { profileActions } from '@/app/[locale]/(shop)/_lib/api/profile';
import { useApiMutation } from '@/shared/lib/hooks/useApiMutation';
import type { User } from '@/shared/types/user';

const profileKey = ['profile'] as const;

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async (data: Partial<User>) => profileActions.update(data),
    successMessage: 'Cập nhật thông tin thành công',
    errorFallback: 'Cập nhật thông tin thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: profileKey });
    },
  });
};
