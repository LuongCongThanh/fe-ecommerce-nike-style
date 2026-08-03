'use client';

import { enableApiMockingBrowser } from '@repo/api-sdk/adapters/browser';
import { useEffect, useState } from 'react';

import { AppQueryProvider } from '@/providers/query-provider';

/**
 * Gates rendering until the MSW browser worker has started (no-op, resolves immediately, when
 * `NEXT_PUBLIC_API_MOCKING` is unset) — otherwise the first query could race the worker's start.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [mockingReady, setMockingReady] = useState(false);

  useEffect(() => {
    enableApiMockingBrowser()
      .then(() => {
        setMockingReady(true);
      })
      .catch(() => {
        setMockingReady(true);
      });
  }, []);

  if (!mockingReady) return null;

  return <AppQueryProvider>{children}</AppQueryProvider>;
}
