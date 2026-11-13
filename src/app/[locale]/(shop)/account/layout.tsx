'use client';

import { AuthGuard } from '@/core/session/AuthGuard';

/** Gates every `/account/*` route (profile, addresses, orders) — client-side, since the middleware's cookie check can't observe the in-memory-only mock session (Decision #90). */
export default function AccountLayout({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return <AuthGuard>{children}</AuthGuard>;
}
