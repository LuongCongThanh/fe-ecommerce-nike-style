'use client';

import { OrderStatusBadge } from '@/app/[locale]/(shop)/_lib/components/common/OrderStatusBadge';
import { useCancelOrder } from '@/app/[locale]/(shop)/_lib/hooks/orders/useCancelOrder';
import { useOrder } from '@/app/[locale]/(shop)/_lib/hooks/orders/useOrder';
import { Button } from '@/shared/components/base/button';
import { Separator } from '@/shared/components/base/separator';
import { ApiError } from '@/shared/lib/errors/api-error';
import { formatCurrency } from '@/shared/lib/utils';

interface OrderDetailClientProps {
  readonly id: string;
}

export function OrderDetailClient({ id }: OrderDetailClientProps): React.JSX.Element {
  const { data: order, isPending, error } = useOrder(id);
  const cancelOrder = useCancelOrder(id);

  if (isPending) {
    return <p className="text-center">Đang tải...</p>;
  }

  if (order == null) {
    const message =
      error instanceof ApiError && error.isNotFound ? 'Không tìm thấy đơn hàng.' : 'Đã có lỗi xảy ra khi tải đơn hàng. Vui lòng thử lại.';
    return <p className="text-center">{message}</p>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Đơn #{order.code}</h1>
          <p className="text-muted-foreground text-sm">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.product_name} x{item.quantity}
            </span>
            <span className="font-medium">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Tổng cộng</span>
          <span className="text-primary">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-1 rounded-xl border p-4 text-sm">
        <p>
          <span className="font-medium">Địa chỉ:</span> {order.address}
        </p>
        <p>
          <span className="font-medium">Thanh toán:</span> {order.payment_method.toUpperCase()}
        </p>
        {order.note.length > 0 ? (
          <p>
            <span className="font-medium">Ghi chú:</span> {order.note}
          </p>
        ) : null}
      </div>

      {order.status === 'pending' && (
        <Button
          variant="destructive"
          className="mt-4"
          onClick={() => {
            cancelOrder.mutate();
          }}
          disabled={cancelOrder.isPending}
        >
          {cancelOrder.isPending ? 'Đang huỷ...' : 'Huỷ đơn hàng'}
        </Button>
      )}
    </>
  );
}
