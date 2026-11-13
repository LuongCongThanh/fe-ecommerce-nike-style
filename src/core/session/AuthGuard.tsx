'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useLocale } from 'next-intl';

import { useIsLoggedIn } from '@/core/session/useAuth';
import { ROUTES } from '@/shared/constants/routes';

export function AuthGuard({ children }: { readonly children: React.ReactNode }): React.JSX.Element | null {
  const router = useRouter();
  const locale = useLocale();
  const isAuthenticated = useIsLoggedIn();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/${locale}${ROUTES.AUTH.LOGIN}`);
    }
  }, [isAuthenticated, locale, router]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
