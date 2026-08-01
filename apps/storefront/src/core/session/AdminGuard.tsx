'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useLocale } from 'next-intl';

import { useAuth } from '@/core/session/useAuth';
import { PageLoader } from '@/shared/components/common/PageLoader';

/**
 * Guard client-side cho `(admin)` — chỉ là UX layer, giống middleware guard
 * (xem middleware.ts). Authorization thật vẫn phải được Django API enforce lại
 * trên từng request `/api/admin/*`.
 */
export function AdminGuard({ children }: { readonly children: React.ReactNode }): React.JSX.Element | null {
  const router = useRouter();
  const locale = useLocale();
  const { isLoggedIn, isAdmin, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;

    if (!isLoggedIn) {
      router.replace(`/${locale}/login`);
      return;
    }

    if (!isAdmin) {
      router.replace(`/${locale}/home`);
    }
  }, [isInitializing, isLoggedIn, isAdmin, locale, router]);

  if (isInitializing || !isLoggedIn || !isAdmin) return <PageLoader />;
  return <>{children}</>;
}
