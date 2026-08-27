import type { ReactNode } from 'react';

interface AuthLayoutProps {
  readonly children: ReactNode;
}

// No max-width/padding baked in here anymore — the login page now needs a wide split-pane card
// (synced with apps/admin + apps/cms's login, see design.md § Variants), while register/forgot-
// password keep their own narrow card by setting `mx-auto w-full max-w-md` on their own wrapper.
export default function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="flex min-h-screen items-center justify-center p-4">{children}</div>;
}
