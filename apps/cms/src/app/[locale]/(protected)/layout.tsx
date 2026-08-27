import { StaffAuthGuard } from '@/core/session';
import { AppShell } from '@/features/shell/AppShell';

/** Issue #24 "CMS: Auth/RBAC shell" — StaffAuthGuard wired the same way as apps/admin's protected
 * layout (login-required baseline every (protected) route sits behind). AppShell now filters
 * NAV_ITEMS by permission (mirrors admin's issue #18 pattern), so ADMIN_STAFF — which has no
 * `content:*` permission — doesn't see the CMS business menu. Per-screen route enforcement stays
 * backend's job (FE gating here is UX-only, per docs/FRONTEND-GUIDE.md §11). */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffAuthGuard>
      <AppShell>{children}</AppShell>
    </StaffAuthGuard>
  );
}
