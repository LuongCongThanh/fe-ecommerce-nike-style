import { createFileRoute, redirect } from '@tanstack/react-router';

import { AppShell } from '@/features/shell/AppShell';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      // TanStack Router's documented pattern: `redirect()` returns a special control-flow object,
      // not an Error, that the router's own boundary catches.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' });
    }
  },
  component: AppShell,
});
