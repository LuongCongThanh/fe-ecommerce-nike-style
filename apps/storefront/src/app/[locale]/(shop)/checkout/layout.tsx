'use client';

import { AuthGuard } from '@/core/session/AuthGuard';

/** Gates `/checkout` and `/checkout/success` — `middleware.ts` already lists `/checkout` as protected, but (like `/account/*` before issue #15) nothing actually enforced it client-side. */
export default function CheckoutLayout({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return <AuthGuard>{children}</AuthGuard>;
}
