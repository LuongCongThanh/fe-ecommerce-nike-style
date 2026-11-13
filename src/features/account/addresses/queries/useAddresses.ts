'use client';

import { useQuery } from '@tanstack/react-query';

import { addressKeys } from '@/features/account/addresses/queries/addressKeys';
import { addressActions } from '@/features/account/addresses/services/address';

export const useAddresses = () =>
  useQuery({
    queryKey: addressKeys.list(),
    queryFn: addressActions.list,
  });
