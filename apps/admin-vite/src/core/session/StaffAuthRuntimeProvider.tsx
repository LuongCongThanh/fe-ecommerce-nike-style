import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';
import { useEffect } from 'react';

import { bootstrapStaffAuth, getStaffAccessToken, refreshStaffAccessToken } from '@/core/session/staff-auth';
import { clearStaffAuth } from '@/core/session/staff-store';

export function StaffAuthRuntimeProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  useEffect(() => {
    const unregister = registerAuthRuntimeAdapter({
      getAccessToken: getStaffAccessToken,
      refreshSession: refreshStaffAccessToken,
      onAuthFailure: () => {
        clearStaffAuth();
      },
    });

    // Adapter must register first — bootstrapStaffAuth() calls refreshStaffAccessToken() through the
    // http client, and the client's interceptor reads this adapter to attach the access token.
    bootstrapStaffAuth().catch(() => undefined);

    return unregister;
  }, []);

  return <>{children}</>;
}
