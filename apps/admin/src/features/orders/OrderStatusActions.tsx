'use client';

import { adminTransitionsFrom } from '@repo/api-sdk/endpoints/order-transitions';
import type { Order } from '@repo/schemas/order';
import { Button } from '@repo/ui/button';

import { useApproveOrderReturn, useRejectOrderReturn, useUpdateOrderStatus } from './useOrderMutations';
import { ConfirmDialog } from '@/features/shell/ConfirmDialog';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  PACKED: 'Đã đóng gói',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
  RETURN_REQUESTED: 'Yêu cầu trả hàng',
  RETURNED: 'Đã trả hàng',
};

interface OrderStatusActionsProps {
  readonly order: Order;
}

/** The status-update buttons — only ever shows transitions `adminTransitionsFrom` says are valid from
 * the order's current status, so an invalid transition can't even be attempted from the UI (issue #22's
 * "UI chặn transition không hợp lệ, không chỉ dựa vào BE"). Return approve/reject is a separate action,
 * shown only while the order is RETURN_REQUESTED. */
export function OrderStatusActions({ order }: OrderStatusActionsProps): React.JSX.Element {
  const updateStatus = useUpdateOrderStatus(order.id);
  const approveReturn = useApproveOrderReturn(order.id);
  const rejectReturn = useRejectOrderReturn(order.id);

  const nextStatuses = adminTransitionsFrom(order.status);
  const mutationError = updateStatus.error ?? approveReturn.error ?? rejectReturn.error;

  return (
    <div className="space-y-2">
      {mutationError !== null ? (
        <p role="alert" className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {mutationError instanceof Error ? mutationError.message : 'Không thể cập nhật đơn hàng.'}
        </p>
      ) : null}

      {order.status === 'RETURN_REQUESTED' ? (
        <div className="flex gap-2">
          <Button
            disabled={approveReturn.isPending}
            onClick={() => {
              approveReturn.mutate();
            }}
          >
            Duyệt trả hàng
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="outline" disabled={rejectReturn.isPending}>
                Từ chối trả hàng
              </Button>
            }
            title="Từ chối yêu cầu trả hàng?"
            description="Đơn hàng sẽ quay lại trạng thái Đã giao, tồn kho không thay đổi."
            confirmLabel="Từ chối"
            loading={rejectReturn.isPending}
            onConfirm={() => {
              rejectReturn.mutate();
            }}
          />
        </div>
      ) : null}

      {nextStatuses.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {nextStatuses.map((status) =>
            status === 'CANCELLED' ? (
              <ConfirmDialog
                key={status}
                trigger={
                  <Button variant="outline" className="text-destructive hover:bg-destructive/10" disabled={updateStatus.isPending}>
                    Huỷ đơn
                  </Button>
                }
                title="Huỷ đơn hàng này?"
                description="Hành động này không thể hoàn tác."
                confirmLabel="Huỷ đơn"
                loading={updateStatus.isPending}
                onConfirm={() => {
                  updateStatus.mutate(status);
                }}
              />
            ) : (
              <Button
                key={status}
                disabled={updateStatus.isPending}
                onClick={() => {
                  updateStatus.mutate(status);
                }}
              >
                Chuyển sang {STATUS_LABEL[status] ?? status}
              </Button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
