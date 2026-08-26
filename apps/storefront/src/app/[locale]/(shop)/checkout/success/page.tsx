// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
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
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <div className="bg-success-50 flex size-24 items-center justify-center rounded-full">
        <CheckCircle className="text-success-500 size-14" strokeWidth={1.5} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-balance">Đặt hàng thành công!</h1>
        {/* SSR can't carry the in-memory-only mock auth token (Decision #90), so `order` may be null even
            for a real order — fall back to the id straight from the URL rather than showing nothing. */}
        {order != null ? (
          <p className="text-muted-foreground mt-1 break-words">Mã đơn hàng: #{order.code}</p>
        ) : orderId != null && orderId.length > 0 ? (
          <p className="text-muted-foreground mt-1 break-words">Mã đơn hàng: #{orderId}</p>
        ) : null}
      </div>
      <p className="text-muted-foreground max-w-md text-balance">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>

      {order != null ? (
        <div className="bg-card w-full space-y-3 rounded-xl border p-5 text-left shadow-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 break-words">
                {item.product_name}
                {item.variant_name.length > 0 ? ` (${item.variant_name})` : ''} x{item.quantity}
              </span>
              <span className="shrink-0 font-medium">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground shrink-0">Địa chỉ giao hàng</span>
            <span className="text-right break-words">{order.address}</span>
          </div>
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Thanh toán</span>
            <span>Khi nhận hàng (COD)</span>
          </div>
          <div className="flex justify-between gap-3 border-t pt-3 font-semibold">
            <span>Tổng cộng</span>
            <span className="text-brand-600">{formatCurrency(order.total)}</span>
          </div>
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button asChild variant="outline" className="border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:text-secondary-800">
          <Link href={`/${locale}/account/orders`}>Xem đơn hàng</Link>
        </Button>
        <Button asChild>
          <Link href={`/${locale}/products`}>Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </div>
  );
}
