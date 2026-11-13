'use client';

import { useQuery } from '@tanstack/react-query';

import { profileActions } from '@/features/account/profile/services/profile';

const profileKey = ['profile'] as const;

export const useProfile = () =>
  useQuery({
    queryKey: profileKey,
    queryFn: profileActions.get,
  });
