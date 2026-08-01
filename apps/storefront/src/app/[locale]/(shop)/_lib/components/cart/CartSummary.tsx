'use client';

import Link from 'next/link';

import { ArrowRight, Truck } from 'lucide-react';

import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { Button } from '@/shared/components/base/button';
import { Separator } from '@/shared/components/base/separator';
import { formatCurrency } from '@/shared/lib/utils';

interface CartSummaryProps {
  readonly locale: string;
}

export function CartSummary({ locale }: CartSummaryProps) {
  const { items, total } = useCart();
  const isEmpty = items.length === 0;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold">Tóm tắt đơn hàng</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tạm tính ({totalQty} sản phẩm)</span>
          <span className="font-medium">{formatCurrency(total)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          <span className="text-success-700 flex items-center gap-1.5 font-medium">
            <Truck className="size-3.5" />
            Miễn phí
          </span>
        </div>

        <Separator className="my-2 opacity-20" />

        <div className="flex justify-between text-base font-bold">
          <span>Tổng cộng</span>
          <span className="text-brand-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {isEmpty ? (
        <Button className="mt-6 h-12 w-full text-base font-semibold" disabled>
          Tiến hành thanh toán
          <ArrowRight className="ml-2 size-4" />
        </Button>
      ) : (
        <Button asChild className="mt-6 h-12 w-full text-base font-semibold">
          <Link href={`/${locale}/checkout`}>
            Tiến hành thanh toán
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      )}

      <Link href={`/${locale}/home`} className="text-muted-foreground hover:text-foreground mt-3 block text-center text-sm transition-colors">
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}
