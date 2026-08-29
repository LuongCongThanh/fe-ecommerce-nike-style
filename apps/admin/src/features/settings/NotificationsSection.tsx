import { useLocalStorage } from '@repo/shared/hooks/useLocalStorage';
import { Label } from '@repo/ui/label';
import { Switch } from '@repo/ui/switch';
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
    <div className="max-w-md space-y-6">
      <p className="text-muted-foreground text-sm">{t('notifications.description')}</p>

      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="pref-order-updates">{t('notifications.orderUpdates')}</Label>
          <p className="text-muted-foreground text-sm">{t('notifications.orderUpdatesDescription')}</p>
        </div>
        <Switch
          id="pref-order-updates"
          checked={prefs.orderUpdates}
          onCheckedChange={(checked) => {
            setPrefs((p) => ({ ...p, orderUpdates: checked }));
          }}
        />
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="pref-low-stock">{t('notifications.lowStock')}</Label>
          <p className="text-muted-foreground text-sm">{t('notifications.lowStockDescription')}</p>
        </div>
        <Switch
          id="pref-low-stock"
          checked={prefs.lowStock}
          onCheckedChange={(checked) => {
            setPrefs((p) => ({ ...p, lowStock: checked }));
          }}
        />
      </div>
    </div>
  );
}
