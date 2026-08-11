'use client';

import Link from 'next/link';

import { QueryState } from '@repo/shared/query-state';
import { Button } from '@repo/ui/button';
import { ShoppingBag } from 'lucide-react';

import { CartSummary } from '@/app/[locale]/(shop)/_lib/components/cart/CartSummary';
import { CartTable } from '@/app/[locale]/(shop)/_lib/components/cart/CartTable';
import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';

interface CartClientProps {
  readonly locale: string;
}

export function CartClient({ locale }: CartClientProps) {
  const { items, isLoading, isHydrated, isError } = useCart();

  return (
    <QueryState isLoading={isLoading || !isHydrated} error={isError ? true : null}>
      {items.length === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
          <div className="bg-muted flex size-20 items-center justify-center rounded-full">
            <ShoppingBag className="text-muted-foreground size-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Giỏ hàng của bạn đang trống</h2>
            <p className="text-muted-foreground mt-2 text-sm">Hãy khám phá các sản phẩm của chúng tôi và thêm vào giỏ hàng!</p>
          </div>
          <Button asChild size="lg">
            <Link href={`/${locale}/products`}>Khám phá sản phẩm</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex-1">
            <CartTable />
          </div>
          <div className="w-full lg:w-80 lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              <CartSummary locale={locale} />
            </div>
          </div>
        </div>
      )}
    </QueryState>
  );
}
