import type { ReactNode } from 'react';

interface AuthLayoutProps {
  readonly children: ReactNode;
}

// Login owns its wide card; register and password pages own their narrow wrappers.
export default function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="flex min-h-screen items-center justify-center p-4">{children}</div>;
}
