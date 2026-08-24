'use client';

// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
import Link from 'next/link';

import { QueryState } from '@repo/shared/query-state';
import { formatCurrency } from '@repo/shared/utils';
import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import { ChevronLeft } from 'lucide-react';
import { useLocale } from 'next-intl';

import { OrderStatusBadge } from '@/app/[locale]/(shop)/_lib/components/common/OrderStatusBadge';
import { useCancelOrder } from '@/app/[locale]/(shop)/_lib/hooks/orders/useCancelOrder';
import { useOrder } from '@/app/[locale]/(shop)/_lib/hooks/orders/useOrder';
import { useRequestReturn } from '@/app/[locale]/(shop)/_lib/hooks/orders/useRequestReturn';
import { ApiError } from '@/shared/lib/errors/api-error';
import { canCancelOrder, canRequestReturn } from '@/shared/types/order';

interface OrderDetailClientProps {
  readonly id: string;
}

export function OrderDetailClient({ id }: OrderDetailClientProps): React.JSX.Element {
  const locale = useLocale();
  const { data: order, isPending, error, refetch } = useOrder(id);
  const cancelOrder = useCancelOrder(id);
  const requestReturn = useRequestReturn(id);

  const notFound = error instanceof ApiError && error.isNotFound;

  return (
    <>
      <Link
        href={`/${locale}/account/orders`}
        className="text-secondary-600 hover:text-secondary-700 mb-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
      >
        <ChevronLeft className="size-4" />
        Đơn hàng của tôi
      </Link>
      <QueryState
        isLoading={isPending}
        error={!notFound && (error != null || order == null) ? (error ?? new Error('Đã có lỗi xảy ra khi tải đơn hàng.')) : null}
        onRetry={() => {
          refetch().catch(() => {
            /* error state already surfaced via isError */
          });
        }}
        errorTitle="Không thể tải đơn hàng"
        errorDescription="Vui lòng thử lại."
      >
        {notFound || order == null ? (
          <p className="text-center">Không tìm thấy đơn hàng.</p>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-3 border-b pb-4">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-balance">Đơn #{order.code}</h1>
                <p className="text-muted-foreground text-sm">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="bg-card space-y-3 rounded-xl border p-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    {item.product_name} x{item.quantity}
                  </span>
                  <span className="shrink-0 font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div className="bg-card mt-4 space-y-1 rounded-xl border p-4 text-sm">
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

            {/* Cancel: PENDING/PROCESSING only — from PACKED onward it must go through DELIVERED →
            RETURN_REQUESTED → RETURNED instead (glossary.md — Cart & Order; issue #17). */}
            {canCancelOrder(order) && (
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
            <span role="status" aria-live="polite" className="sr-only">
              {cancelOrder.isPending ? 'Đang huỷ đơn hàng...' : ''}
            </span>

            {/* Return request: DELIVERED only, within the 7-day return window (glossary.md — Return window; issue #17). */}
            {canRequestReturn(order) && (
              <Button
                variant="outline"
                className="border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:text-secondary-800 mt-4"
                onClick={() => {
                  requestReturn.mutate();
                }}
                disabled={requestReturn.isPending}
              >
                {requestReturn.isPending ? 'Đang gửi yêu cầu...' : 'Yêu cầu trả hàng'}
              </Button>
            )}
            <span role="status" aria-live="polite" className="sr-only">
              {requestReturn.isPending ? 'Đang gửi yêu cầu trả hàng...' : ''}
            </span>
            {order.status === 'DELIVERED' && !canRequestReturn(order) && (
              <p className="text-muted-foreground mt-4 text-sm">Đã quá hạn 7 ngày để yêu cầu trả hàng cho đơn này.</p>
            )}
          </>
        )}
      </QueryState>
    </>
  );
}
