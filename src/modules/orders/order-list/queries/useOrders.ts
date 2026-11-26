'use client';

import { useQuery } from '@tanstack/react-query';

import { getOrders } from '@/integrations/backend/endpoints/orders';
import { orderKeys } from '@/modules/orders/queries/orderKeys';

export const useOrders = () =>
  useQuery({
    queryKey: orderKeys.list(),
    queryFn: getOrders,
  });
