import { Badge } from '@repo/ui/badge';

import type { OrderStatus } from '@/shared/types/order';

const STATUS_MAP: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Chờ xác nhận', variant: 'secondary' },
  PROCESSING: { label: 'Đang xử lý', variant: 'default' },
  PACKED: { label: 'Đã đóng gói', variant: 'default' },
  SHIPPED: { label: 'Đang giao', variant: 'default' },
  DELIVERED: { label: 'Đã giao', variant: 'outline' },
  CANCELLED: { label: 'Đã huỷ', variant: 'destructive' },
  RETURN_REQUESTED: { label: 'Yêu cầu trả hàng', variant: 'secondary' },
  RETURNED: { label: 'Đã trả hàng', variant: 'outline' },
};

export function OrderStatusBadge({ status }: { readonly status: OrderStatus }) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
