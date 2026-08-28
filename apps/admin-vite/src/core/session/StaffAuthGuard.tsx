import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useStaffAuth } from '@/core/session/useStaffAuth';

/**
 * Client-side guard for the `_authenticated` layout route — UX layer only, mirrors storefront's
 * `AuthGuard`. Real authorization must still be enforced by the backend on every `/api/admin/*`
 * request (issue #18's acceptance criteria: "không tự quyết định quyền, không giả định đây là
 * authorization thật").
 *
 * A route-level `beforeLoad` redirect (TanStack Router's usual pattern) can't be used here: staff
 * auth bootstraps asynchronously (`bootstrapStaffAuth` refreshes the session on mount), so at the
 * moment `beforeLoad` runs synchronously the store is still `initializing` — not yet know-it's-logged
 * -out. This component instead waits for that to settle before deciding to redirect.
 */
export function StaffAuthGuard({ children }: { readonly children: React.ReactNode }): React.JSX.Element | null {
  const navigate = useNavigate();
  const { isLoggedIn, isInitializing } = useStaffAuth();

  useEffect(() => {
    if (isInitializing) return;
    if (!isLoggedIn) {
      void navigate({ to: '/login' });
    }
  }, [isInitializing, isLoggedIn, navigate]);

  if (isInitializing || !isLoggedIn) return null;
  return <>{children}</>;
}
