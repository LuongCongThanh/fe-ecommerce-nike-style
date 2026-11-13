'use client';

import { useQuery } from '@tanstack/react-query';

import { addressKeys } from '@/app/[locale]/(shop)/account/addresses/queries/addressKeys';
import { addressActions } from '@/app/[locale]/(shop)/account/addresses/services/address';

export const useAddresses = () =>
  useQuery({
    queryKey: addressKeys.list(),
    queryFn: addressActions.list,
  });
