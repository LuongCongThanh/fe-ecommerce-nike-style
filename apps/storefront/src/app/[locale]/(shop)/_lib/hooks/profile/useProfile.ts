'use client';

import { useQuery } from '@tanstack/react-query';

import { profileActions } from '@/app/[locale]/(shop)/_lib/api/profile';

const profileKey = ['profile'] as const;

export const useProfile = () =>
  useQuery({
    queryKey: profileKey,
    queryFn: profileActions.get,
  });
