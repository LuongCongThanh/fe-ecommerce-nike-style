import { enableApiMockingBrowser } from '@repo/api-sdk/adapters/browser';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import { StaffAuthRuntimeProvider } from '@/core/session';
import i18n from '@/i18n';
import { AppQueryProvider } from '@/providers/query-provider';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent(): React.JSX.Element | null {
  const [isMockingReady, setIsMockingReady] = useState(false);

  // Gates rendering until the MSW browser worker has started (no-op, resolves immediately, when
  // VITE_API_MOCKING is unset) — otherwise the first query could race the worker's start. Ported
  // from the Next.js admin's AppProviders.
  useEffect(() => {
    // '/admin' — must match vite.config.ts's `base` (the worker script itself is served from
    // public/, prefixed by the app's own base path, same as the old Next.js basePath behavior).
    enableApiMockingBrowser('/admin')
      .then(() => {
        setIsMockingReady(true);
      })
      .catch(() => {
        setIsMockingReady(true);
      });
  }, []);

  if (!isMockingReady) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <I18nextProvider i18n={i18n}>
        <AppQueryProvider>
          <StaffAuthRuntimeProvider>
            <Outlet />
          </StaffAuthRuntimeProvider>
        </AppQueryProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}
