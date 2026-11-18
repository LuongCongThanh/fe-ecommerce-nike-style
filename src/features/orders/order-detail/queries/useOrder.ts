'use client';

import { useQuery } from '@tanstack/react-query';

import { orderKeys } from '@/features/orders/queries/orderKeys';
import { getOrder } from '@/lib/api/endpoints/orders';

export const useOrder = (id: string) =>
  useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => getOrder(id),
  });
