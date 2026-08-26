import { StaffAuthGuard } from '@/core/session/StaffAuthGuard';
import { AppShell } from '@/features/shell/AppShell';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffAuthGuard>
      <AppShell>{children}</AppShell>
    </StaffAuthGuard>
  );
}
