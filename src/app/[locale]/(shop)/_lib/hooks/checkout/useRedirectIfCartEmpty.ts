'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';

/**
 * Guard rule: Checkout never renders for a genuinely empty cart — redirects back to `/cart` instead.
 * Gated on `isHydrated` — both `items` (live-resolved via an async query) and the persisted `itemCount`
 * start out empty on every fresh mount, which made this redirect fire immediately even for a cart that
 * genuinely has items, before localStorage had a chance to load (issue #16).
 */
export function useRedirectIfCartEmpty(locale: string): void {
  const router = useRouter();
  const { itemCount, isHydrated } = useCart();

  useEffect(() => {
    if (isHydrated && itemCount === 0) {
      router.replace(`/${locale}/cart`);
    }
  }, [isHydrated, itemCount, router, locale]);
}
