// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
'use client';

import Link from 'next/link';

import { ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CartSummary } from '@/features/cart/components/CartSummary';
import { CartTable } from '@/features/cart/components/CartTable';
import { useCart } from '@/features/cart/hooks/useCart';
import { Button } from '@/shared/ui/Button';
import { QueryState } from '@/shared/ui/QueryState';

interface CartClientProps {
  readonly locale: string;
}

export function CartClient({ locale }: CartClientProps) {
  const t = useTranslations('common');
  const { items, isLoading, isHydrated, isError } = useCart();

  return (
    <QueryState
      isLoading={isLoading || !isHydrated}
      error={isError ? true : null}
      loadingLabel={t('loading')}
      errorTitle={t('errorTitle')}
      errorFallbackDescription={t('errorDescription')}
      retryLabel={t('retry')}
    >
      {items.length === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-xl border border-dashed p-8 text-center">
          <div className="bg-muted flex size-20 items-center justify-center rounded-full">
            <ShoppingBag className="text-muted-foreground size-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-balance">Giỏ hàng của bạn đang trống</h2>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm text-balance">Hãy khám phá các sản phẩm của chúng tôi và thêm vào giỏ hàng!</p>
          </div>
          <Button asChild size="lg">
            <Link href={`/${locale}/products`}>Khám phá sản phẩm</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1">
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
