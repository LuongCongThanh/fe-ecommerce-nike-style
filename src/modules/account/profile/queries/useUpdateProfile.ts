'use client';

import { useQueryClient } from '@tanstack/react-query';

import { updateProfile } from '@/integrations/backend/endpoints/profile';
import type { User } from '@/integrations/backend/models/user.types';
import { useApiMutation } from '@/shared/queries/useApiMutation';

const profileKey = ['profile'] as const;

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: async (data: Partial<User>) => updateProfile(data),
    successMessage: 'Cập nhật thông tin thành công',
    errorFallback: 'Cập nhật thông tin thất bại. Vui lòng thử lại.',
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: profileKey });
    },
  });
};
