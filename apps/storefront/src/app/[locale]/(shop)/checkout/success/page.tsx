import Link from 'next/link';

import { formatCurrency } from '@repo/shared/utils';
import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import { CheckCircle } from 'lucide-react';

import { orderActions } from '@/app/[locale]/(shop)/_lib/api/order';
import type { Order } from '@/shared/types/order';

// Depends on the request's auth cookies to fetch a real order — see `account/orders/page.tsx` for why
// this can't be statically generated.
export const dynamic = 'force-dynamic';

async function getOrder(orderId: string | undefined): Promise<Order | null> {
  if (orderId === undefined || orderId === '') return null;
  try {
    return await orderActions.detail(orderId);
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<{ orderId?: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await params;
  const { orderId } = await searchParams;
  const order = await getOrder(orderId);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-6 py-12 text-center">
      <CheckCircle className="size-20 text-green-500" />
      <div>
        <h1 className="text-2xl font-bold">Đặt hàng thành công!</h1>
        {/* SSR can't carry the in-memory-only mock auth token (Decision #90), so `order` may be null even
            for a real order — fall back to the id straight from the URL rather than showing nothing. */}
        {order != null ? (
          <p className="text-muted-foreground mt-1">Mã đơn hàng: #{order.code}</p>
        ) : orderId != null && orderId.length > 0 ? (
          <p className="text-muted-foreground mt-1">Mã đơn hàng: #{orderId}</p>
        ) : null}
      </div>
      <p className="text-muted-foreground max-w-md">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>

      {order != null ? (
        <div className="w-full space-y-3 rounded-xl border p-4 text-left">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product_name}
                {item.variant_name.length > 0 ? ` (${item.variant_name})` : ''} x{item.quantity}
              </span>
              <span className="font-medium">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Địa chỉ giao hàng</span>
            <span className="text-right">{order.address}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Thanh toán</span>
            <span>Khi nhận hàng (COD)</span>
          </div>
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Tổng cộng</span>
            <span className="text-primary">{formatCurrency(order.total)}</span>
          </div>
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href={`/${locale}/account/orders`}>Xem đơn hàng</Link>
        </Button>
        <Button asChild>
          <Link href={`/${locale}/products`}>Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </div>
  );
}
