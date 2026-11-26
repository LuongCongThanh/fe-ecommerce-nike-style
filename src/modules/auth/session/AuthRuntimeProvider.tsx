'use client';

import { useEffect } from 'react';

import { registerAuthRuntimeAdapter } from '@/integrations/backend/client/runtime';
import { bootstrapAuth, clearAuth, getAccessToken, refreshAccessToken } from '@/modules/auth/stores/auth.store';

export function AuthRuntimeProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  useEffect(() => {
    const unregister = registerAuthRuntimeAdapter({
      getAccessToken,
      refreshSession: refreshAccessToken,
      onAuthFailure: () => {
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
