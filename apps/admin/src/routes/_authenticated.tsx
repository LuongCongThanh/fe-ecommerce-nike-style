import { createFileRoute, Outlet } from '@tanstack/react-router';

import { StaffAuthGuard } from '@/core/session';
import { AppShell } from '@/shell/AppShell';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout(): React.JSX.Element {
  return (
    <StaffAuthGuard>
      <AppShell>
        <Outlet />
      </AppShell>
    </StaffAuthGuard>
  );
}
