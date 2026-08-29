import { enableApiMockingBrowser } from '@repo/api-sdk/adapters/browser';
import { AppQueryProvider } from '@repo/shared/query-provider';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BASE_PATH } from '@/base-path';

import { AppShell } from '@/features/shell/AppShell';
import i18n from '@/i18n';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent(): React.JSX.Element | null {
  const [isMockingReady, setIsMockingReady] = useState(false);

  // Ported from the Next.js cms's AppProviders — gates rendering until the MSW browser worker has
  // started (no-op when VITE_API_MOCKING is unset).
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

  // No auth guard yet — mirrors the Next.js cms's (protected) layout, whose own comment says RBAC
  // enforcement is a separate slice (issue #24) not yet wired here either.
  return (
    <I18nextProvider i18n={i18n}>
      <AppQueryProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </AppQueryProvider>
    </I18nextProvider>
  );
}
