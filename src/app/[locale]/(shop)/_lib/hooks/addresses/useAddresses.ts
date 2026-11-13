'use client';

import { useQuery } from '@tanstack/react-query';

import { addressActions } from '@/app/[locale]/(shop)/_lib/api/address';
import { addressKeys } from '@/app/[locale]/(shop)/_lib/hooks/addresses/addressKeys';

export const useAddresses = () =>
  useQuery({
    queryKey: addressKeys.list(),
    queryFn: addressActions.list,
  });
