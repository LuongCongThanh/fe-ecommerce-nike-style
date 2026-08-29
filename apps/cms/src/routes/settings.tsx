import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { NotificationsSection } from '@/features/settings/NotificationsSection';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

/** Just Notifications for now — cms has neither a theme system (`apps/admin` has `next-themes`,
 * cms doesn't) nor a signed-in-user concept yet (see `routes/__root.tsx`'s own "No auth guard
 * yet" comment, issue #24) to build a Profile/Appearance tab on top of. Adding either is a
 * separate, bigger slice than "port the Settings page". */
function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
      </div>
      <NotificationsSection />
    </div>
  );
}
