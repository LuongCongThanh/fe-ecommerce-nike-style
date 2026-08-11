'use client';

import Link from 'next/link';

import { QueryState } from '@repo/shared/query-state';
import { formatCurrency } from '@repo/shared/utils';
import { useLocale } from 'next-intl';

import { OrderStatusBadge } from '@/app/[locale]/(shop)/_lib/components/common/OrderStatusBadge';
import { useOrders } from '@/app/[locale]/(shop)/_lib/hooks/orders/useOrders';

/**
 * Fetches client-side via `useOrders()` rather than taking a server-fetched prop — the mock auth token
 * only ever lives in browser memory (Decision #90), so a server-side fetch here would always 401/empty
 * regardless of whether the customer is actually signed in.
 */
export function OrdersClient(): React.JSX.Element {
  const locale = useLocale();
  const { data: orders, isLoading, isError, refetch } = useOrders();

  return (
    <QueryState
      isLoading={isLoading}
      error={isError ? new Error('Đã có lỗi xảy ra khi tải đơn hàng.') : null}
      onRetry={() => {
        refetch().catch(() => {
          /* error state already surfaced via isError */
        });
      }}
      errorTitle="Không thể tải đơn hàng"
      errorDescription="Vui lòng thử lại."
    >
      {orders === undefined ? null : orders.length === 0 ? (
        <p className="text-muted-foreground text-center">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/${locale}/account/orders/${String(order.id)}`}
              className="block rounded-xl border p-4 transition hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Đơn #{order.code}</p>
                  <p className="text-muted-foreground text-sm">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-primary font-semibold">{formatCurrency(order.total)}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </QueryState>
  );
}
