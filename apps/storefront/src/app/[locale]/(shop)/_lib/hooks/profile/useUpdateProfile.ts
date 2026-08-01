'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { profileActions } from '@/app/[locale]/(shop)/_lib/api/profile';
import { ApiError } from '@/shared/lib/errors/api-error';
import type { User } from '@/shared/types/user';

const profileKey = ['profile'] as const;

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<User>) => profileActions.update(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: profileKey });
      toast.success('Cập nhật thông tin thành công');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Cập nhật thông tin thất bại. Vui lòng thử lại.');
    },
  });
};
