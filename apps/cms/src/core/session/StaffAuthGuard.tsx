'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useStaffAuth } from '@/core/session/useStaffAuth';

/**
 * Client-side guard for `app/(protected)/*` — UX layer only, mirrors storefront's `AuthGuard`.
 * Real authorization must still be enforced by the backend on every `/api/cms/*` request (issue #24's
 * acceptance criteria, mirroring #18: "không tự quyết định quyền, không giả định đây là authorization thật").
 */
export function StaffAuthGuard({ children }: { readonly children: React.ReactNode }): React.JSX.Element | null {
  const router = useRouter();
  const { isLoggedIn, isInitializing } = useStaffAuth();

  useEffect(() => {
    if (isInitializing) return;
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isInitializing, isLoggedIn, router]);

  if (isInitializing || !isLoggedIn) return null;
  return <>{children}</>;
}
