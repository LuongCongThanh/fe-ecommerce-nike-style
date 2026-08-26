'use client';

import { approveAdminOrderReturn, rejectAdminOrderReturn, updateAdminOrderStatus } from '@repo/api-sdk/endpoints/admin-orders';
import type { OrderStatus } from '@repo/schemas/order';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminOrderKeys } from './useAdminOrders';

function invalidateOrder(qc: ReturnType<typeof useQueryClient>, id: number) {
  return Promise.all([qc.invalidateQueries({ queryKey: adminOrderKeys.list }), qc.invalidateQueries({ queryKey: adminOrderKeys.detail(id) })]);
}

export function useUpdateOrderStatus(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) => updateAdminOrderStatus(id, status),
    onSuccess: () => invalidateOrder(qc, id),
  });
}

export function useApproveOrderReturn(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => approveAdminOrderReturn(id),
    onSuccess: () => invalidateOrder(qc, id),
  });
}

export function useRejectOrderReturn(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => rejectAdminOrderReturn(id),
    onSuccess: () => invalidateOrder(qc, id),
  });
}
