import { AppShell } from '@/features/shell/AppShell';

/** RBAC enforcement is a separate slice (see issue #18, "Admin: Auth/RBAC shell") — this only wires the application shell. */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
