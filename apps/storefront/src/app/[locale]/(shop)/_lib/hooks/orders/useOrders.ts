'use client';

import { useQuery } from '@tanstack/react-query';

import { orderActions } from '@/app/[locale]/(shop)/_lib/api/order';
import { orderKeys } from '@/app/[locale]/(shop)/_lib/hooks/orders/orderKeys';

export const useOrders = () =>
  useQuery({
    queryKey: orderKeys.list(),
    queryFn: orderActions.list,
  });
