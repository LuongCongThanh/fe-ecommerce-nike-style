'use client';

import Link from 'next/link';

import { useLocale } from 'next-intl';

import { OrderStatusBadge } from '@/app/[locale]/(shop)/_lib/components/common/OrderStatusBadge';
import { formatCurrency } from '@/shared/lib/utils';
import type { Order } from '@/shared/types/order';

interface OrdersClientProps {
  readonly orders: Order[];
}

export function OrdersClient({ orders }: OrdersClientProps): React.JSX.Element {
  const locale = useLocale();

  if (orders.length === 0) {
    return <p className="text-muted-foreground text-center">Bạn chưa có đơn hàng nào.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link key={order.id} href={`/${locale}/orders/${String(order.id)}`} className="block rounded-xl border p-4 transition hover:shadow-sm">
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
  );
}
