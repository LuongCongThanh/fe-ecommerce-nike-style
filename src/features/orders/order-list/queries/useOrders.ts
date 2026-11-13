'use client';

import { useQuery } from '@tanstack/react-query';

import { orderKeys } from '@/features/orders/queries/orderKeys';
import { orderActions } from '@/features/orders/services/order';

export const useOrders = () =>
  useQuery({
    queryKey: orderKeys.list(),
    queryFn: orderActions.list,
  });
