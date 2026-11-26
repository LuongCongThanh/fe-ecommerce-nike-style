'use client';

import { useQuery } from '@tanstack/react-query';

import { getOrder } from '@/integrations/backend/endpoints/orders';
import { orderKeys } from '@/modules/orders/queries/orderKeys';

export const useOrder = (id: string) =>
  useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => getOrder(id),
  });
