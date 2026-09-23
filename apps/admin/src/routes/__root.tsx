import { enableApiMockingBrowser } from '@repo/api-sdk/adapters/browser';
import { AppQueryProvider } from '@repo/shared/query-provider';
import { Toaster } from '@repo/ui/sonner';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BASE_PATH } from '@/base-path';

import { StaffAuthRuntimeProvider } from '@/core/session';
import i18n from '@/i18n';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent(): React.JSX.Element | null {
  const [isMockingReady, setIsMockingReady] = useState(false);

  // Gates rendering until the MSW browser worker has started (no-op, resolves immediately, when
  // VITE_API_MOCKING is unset) — otherwise the first query could race the worker's start. Ported
  // from the Next.js admin's AppProviders.
  useEffect(() => {
    enableApiMockingBrowser(BASE_PATH)
      .then(() => {
        setIsMockingReady(true);
      })
      .catch(() => {
        setIsMockingReady(true);
      });
  }, []);

  if (!isMockingReady) return null;

  // No provider needed here (unlike Clerk) — `createBetterAuthModule`'s `useSession()` reads off a
  // module-level nanostore, not React context; `StaffAuthRuntimeProvider` (below) only registers
  // the `@repo/api-sdk` auth adapter, it doesn't wrap anything Better Auth-specific.
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <I18nextProvider i18n={i18n}>
        <AppQueryProvider>
          <StaffAuthRuntimeProvider>
            <Outlet />
            <ThemedToaster />
          </StaffAuthRuntimeProvider>
        </AppQueryProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}

/** `@repo/ui`'s `Toaster` takes `theme` as a plain prop (that package has no `next-themes`
 * dependency) — this app does, so it reads the real resolved theme here instead of hardcoding
 * `'system'`. */
function ThemedToaster(): React.JSX.Element {
  const { resolvedTheme } = useTheme();
  return <Toaster theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />;
}
