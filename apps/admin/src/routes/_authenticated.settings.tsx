import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/shell/PageHeader';

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsLayout,
});

const TABS = [
  { to: '/settings', labelKey: 'profile' },
  { to: '/settings/appearance', labelKey: 'appearance' },
  { to: '/settings/notifications', labelKey: 'notifications' },
] as const;

function SettingsLayout(): React.JSX.Element {
  const { t } = useTranslation('settings');
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="space-y-4">
      <PageHeader title={t('title')} />
      <p className="text-muted-foreground -mt-2 text-sm">{t('subtitle')}</p>

      <div className="border-b">
        <nav className="-mb-px flex gap-4">
          {TABS.map((tab) => {
            const isActive = pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'border-primary text-foreground' : 'text-muted-foreground hover:text-foreground border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {t(`tabs.${tab.labelKey}`)}
              </Link>
            );
          })}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
