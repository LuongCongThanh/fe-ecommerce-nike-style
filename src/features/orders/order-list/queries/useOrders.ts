'use client';

import { useQuery } from '@tanstack/react-query';

import { orderKeys } from '@/features/orders/queries/orderKeys';
import { getOrders } from '@/lib/api/endpoints/orders';

export const useOrders = () =>
  useQuery({
    queryKey: orderKeys.list(),
    queryFn: getOrders,
  });
