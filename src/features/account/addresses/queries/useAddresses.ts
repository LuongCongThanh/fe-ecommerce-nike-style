'use client';

import { useQuery } from '@tanstack/react-query';

import { addressKeys } from '@/features/account/addresses/queries/addressKeys';
import { getAddresses } from '@/integrations/backend/endpoints/address';

export const useAddresses = () =>
  useQuery({
    queryKey: addressKeys.list(),
    queryFn: getAddresses,
  });
