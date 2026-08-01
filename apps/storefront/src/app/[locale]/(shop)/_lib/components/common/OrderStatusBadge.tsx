import { Badge } from '@/shared/components/base/badge';
import type { OrderStatus } from '@/shared/types/order';

const STATUS_MAP: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Chờ xác nhận', variant: 'secondary' },
  confirmed: { label: 'Đã xác nhận', variant: 'default' },
  processing: { label: 'Đang xử lý', variant: 'default' },
  shipped: { label: 'Đang giao', variant: 'default' },
  delivered: { label: 'Đã giao', variant: 'outline' },
  cancelled: { label: 'Đã huỷ', variant: 'destructive' },
};

export function OrderStatusBadge({ status }: { readonly status: OrderStatus }) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
