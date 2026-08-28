import { Button } from '@repo/ui/button';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

/**
 * Minimal Stage-1 shell (sidebar + top bar) — a placeholder for the sidebar/header ported from
 * shadcn-admin's `components/layout/` in Stage 2, once feature routes exist to navigate between.
 */
export function AppShell(): React.JSX.Element {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <p className="mb-6 text-lg font-bold">Admin</p>
        <nav className="space-y-1">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5">
            <LayoutDashboard className="size-4" aria-hidden="true" />
            {t('nav.dashboard', { defaultValue: 'Dashboard' })}
          </Link>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-gray-800">
          <span className="text-sm text-gray-500">{user?.name}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              signOut();
              void navigate({ to: '/login' });
            }}
          >
            <LogOut className="size-4" data-icon="inline-start" aria-hidden="true" />
            {t('actions.logout', { defaultValue: 'Log out' })}
          </Button>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
