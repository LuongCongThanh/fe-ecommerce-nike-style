import { StaffAuthGuard } from '@/core/session';
import { AppShell } from '@/features/shell/AppShell';

/** Issue #24 "CMS: Auth/RBAC shell" — StaffAuthGuard wired the same way as apps/admin's protected
 * layout. Per-permission gating of individual screens is still a follow-up; this is the login-
 * required baseline every (protected) route now sits behind. */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffAuthGuard>
      <AppShell>{children}</AppShell>
    </StaffAuthGuard>
  );
}
