'use client';

import { useQuery } from '@tanstack/react-query';

import { getAddresses } from '@/integrations/backend/endpoints/address';
import { addressKeys } from '@/modules/account/addresses/queries/addressKeys';

export const useAddresses = () =>
  useQuery({
    queryKey: addressKeys.list(),
    queryFn: getAddresses,
  });
