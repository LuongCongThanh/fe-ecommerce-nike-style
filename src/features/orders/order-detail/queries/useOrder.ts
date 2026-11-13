'use client';

import { useQuery } from '@tanstack/react-query';

import { orderKeys } from '@/features/orders/queries/orderKeys';
import { orderActions } from '@/features/orders/services/order';

export const useOrder = (id: string) =>
  useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => orderActions.detail(id),
  });
