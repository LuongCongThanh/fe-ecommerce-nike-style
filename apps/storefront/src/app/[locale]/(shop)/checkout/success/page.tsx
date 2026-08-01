import Link from 'next/link';

import { CheckCircle } from 'lucide-react';

import { Button } from '@/shared/components/base/button';

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<{ orderId?: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await params;
  const { orderId } = await searchParams;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <CheckCircle className="size-20 text-green-500" />
      <div>
        <h1 className="text-2xl font-bold">Đặt hàng thành công!</h1>
        {orderId != null && orderId.length > 0 ? <p className="text-muted-foreground mt-1">Mã đơn hàng: #{orderId}</p> : null}
      </div>
      <p className="text-muted-foreground max-w-md">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href={`/${locale}/orders`}>Xem đơn hàng</Link>
        </Button>
        <Button asChild>
          <Link href={`/${locale}/products`}>Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </div>
  );
}
