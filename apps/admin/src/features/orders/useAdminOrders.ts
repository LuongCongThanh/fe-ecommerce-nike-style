import { getAdminOrder, getAdminOrders } from '@repo/api-sdk/endpoints/admin-orders';
import { useQuery } from '@tanstack/react-query';

export const adminOrderKeys = {
  list: ['admin', 'orders'] as const,
  detail: (id: number) => ['admin', 'orders', id] as const,
};

export function useAdminOrders() {
  return useQuery({
    queryKey: adminOrderKeys.list,
    queryFn: getAdminOrders,
  });
}

export function useAdminOrder(id: number) {
  return useQuery({
    queryKey: adminOrderKeys.detail(id),
    queryFn: () => getAdminOrder(id),
  });
}
