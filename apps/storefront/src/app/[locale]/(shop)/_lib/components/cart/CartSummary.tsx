// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
'use client';

import Link from 'next/link';

import { formatCurrency } from '@repo/shared/utils';
import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import { ArrowRight, Truck } from 'lucide-react';

import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';

interface CartSummaryProps {
  readonly locale: string;
}

export function CartSummary({ locale }: CartSummaryProps) {
  const { items, total } = useCart();
  const isEmpty = items.length === 0;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold tracking-tight">Tóm tắt đơn hàng</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Tạm tính ({totalQty} sản phẩm)</span>
          <span className="font-medium">{formatCurrency(total)}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          <span className="text-success-700 flex items-center gap-1.5 font-medium">
            <Truck className="size-3.5" />
            Miễn phí
          </span>
        </div>

        <Separator className="my-2" />

        <div className="flex justify-between gap-3 text-base font-bold">
          <span>Tổng cộng</span>
          <span className="text-brand-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {isEmpty ? (
        <Button className="mt-6 h-12 w-full text-base font-semibold" disabled>
          Tiến hành thanh toán
          <ArrowRight className="ml-2 size-4" data-icon="inline-end" />
        </Button>
      ) : (
        <Button asChild className="mt-6 h-12 w-full text-base font-semibold">
          <Link href={`/${locale}/checkout`}>
            Tiến hành thanh toán
            <ArrowRight className="ml-2 size-4" data-icon="inline-end" />
          </Link>
        </Button>
      )}

      <Link
        href={`/${locale}/home`}
        className="text-secondary-600 hover:text-secondary-700 mt-3 block text-center text-sm font-medium transition-colors"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}
