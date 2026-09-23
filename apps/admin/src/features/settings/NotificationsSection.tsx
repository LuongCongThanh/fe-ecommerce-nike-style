import { useLocalStorage } from '@repo/shared/hooks/useLocalStorage';
import { ToggleSettingsList } from '@repo/ui/toggle-settings-list';
import { useTranslation } from 'react-i18next';

interface NotificationPrefs {
  readonly orderUpdates: boolean;
  readonly lowStock: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = { orderUpdates: true, lowStock: true };

/** Real, but per-browser only (`localStorage`) — there is no notification-delivery service behind
 * this yet, so this genuinely is the whole feature rather than a stand-in for a backend call. */
export function NotificationsSection(): React.JSX.Element {
  const { t } = useTranslation('settings');
  const [prefs, setPrefs] = useLocalStorage<NotificationPrefs>('admin.notification-prefs', DEFAULT_PREFS);

  return (
    <ToggleSettingsList
      description={t('notifications.description')}
      items={[
        {
          id: 'pref-order-updates',
          checked: prefs.orderUpdates,
          label: t('notifications.orderUpdates'),
          description: t('notifications.orderUpdatesDescription'),
          onCheckedChange: (checked) => {
            setPrefs((p) => ({ ...p, orderUpdates: checked }));
          },
        },
        {
          id: 'pref-low-stock',
          checked: prefs.lowStock,
          label: t('notifications.lowStock'),
          description: t('notifications.lowStockDescription'),
          onCheckedChange: (checked) => {
            setPrefs((p) => ({ ...p, lowStock: checked }));
          },
        },
      ]}
    />
  );
}
