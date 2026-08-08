import { Badge } from '@repo/ui/badge';

import type { OrderStatus } from '@/shared/types/order';

// Mỗi trạng thái trong luồng chính (PENDING→PROCESSING→PACKED→SHIPPED→DELIVERED/CANCELLED) có màu badge
// riêng để phân biệt được ở cái nhìn đầu tiên. RETURN_REQUESTED/RETURNED chỉ nhánh sau DELIVERED nên
// dùng lại 'outline'/'secondary' — không bao giờ hiển thị cạnh các trạng thái đang vận chuyển.
const STATUS_MAP: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' }
> = {
  PENDING: { label: 'Chờ xác nhận', variant: 'secondary' },
  PROCESSING: { label: 'Đang xử lý', variant: 'info' },
  PACKED: { label: 'Đã đóng gói', variant: 'warning' },
  SHIPPED: { label: 'Đang giao', variant: 'default' },
  DELIVERED: { label: 'Đã giao', variant: 'success' },
  CANCELLED: { label: 'Đã huỷ', variant: 'destructive' },
  RETURN_REQUESTED: { label: 'Yêu cầu trả hàng', variant: 'outline' },
  RETURNED: { label: 'Đã trả hàng', variant: 'secondary' },
};

export function OrderStatusBadge({ status }: { readonly status: OrderStatus }) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
