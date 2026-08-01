'use client';

import { useEffect } from 'react';

import { bootstrapAuth, clearAuth, getAccessToken, refreshAccessToken } from '@/core/session/auth-store';
import { registerHttpRuntimeAdapter } from '@/shared/lib/http/runtime';

export function AuthRuntimeProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  useEffect(() => {
    const unregister = registerHttpRuntimeAdapter({
      getAccessToken,
      refreshAccessToken,
      onRefreshFailure: () => {
        clearAuth();
      },
    });

    // Adapter phải đăng ký trước — bootstrapAuth() gọi refreshAccessToken() qua http client,
    // và interceptor của http client đọc adapter này để đính access token.
    bootstrapAuth().catch(() => undefined);

    return unregister;
  }, []);

  return <>{children}</>;
}
