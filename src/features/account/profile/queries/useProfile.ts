'use client';

import { useQuery } from '@tanstack/react-query';

import { getProfile } from '@/lib/api/endpoints/profile';

const profileKey = ['profile'] as const;

export const useProfile = () =>
  useQuery({
    queryKey: profileKey,
    queryFn: getProfile,
  });
