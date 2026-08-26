'use client';

import { enableApiMockingBrowser } from '@repo/api-sdk/adapters/browser';
import { useEffect, useState } from 'react';

import { StaffAuthRuntimeProvider } from '@/core/session/StaffAuthRuntimeProvider';
import { AppQueryProvider } from '@/providers/query-provider';

/**
 * Gates rendering until the MSW browser worker has started (no-op, resolves immediately, when
 * `NEXT_PUBLIC_API_MOCKING` is unset) — otherwise the first query could race the worker's start.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [isMockingReady, setIsMockingReady] = useState(false);

  useEffect(() => {
    // '/cms' — must match next.config.ts's basePath (packages/api-sdk's mock service worker lives
    // under the app's own basePath in `public/`, not the site root).
    enableApiMockingBrowser('/cms')
      .then(() => {
        setIsMockingReady(true);
      })
      .catch(() => {
        setIsMockingReady(true);
      });
  }, []);

  if (!isMockingReady) return null;

  return (
    <AppQueryProvider>
      <StaffAuthRuntimeProvider>{children}</StaffAuthRuntimeProvider>
    </AppQueryProvider>
  );
}
