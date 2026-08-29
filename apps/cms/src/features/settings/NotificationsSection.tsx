import { useLocalStorage } from '@repo/shared/hooks/useLocalStorage';
import { Label } from '@repo/ui/label';
import { Switch } from '@repo/ui/switch';
import { useTranslation } from 'react-i18next';

interface NotificationPrefs {
  readonly contentPublished: boolean;
  readonly mediaUploaded: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = { contentPublished: true, mediaUploaded: true };

/** Real, but per-browser only (`localStorage`) — no notification-delivery service exists behind this
 * yet, so this is the whole feature, not a stand-in for a backend call. */
export function NotificationsSection(): React.JSX.Element {
  const { t } = useTranslation('settings');
  const [prefs, setPrefs] = useLocalStorage<NotificationPrefs>('cms.notification-prefs', DEFAULT_PREFS);

  return (
    <div className="max-w-md space-y-6">
      <p className="text-muted-foreground text-sm">{t('notifications.description')}</p>

      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="pref-content-published">{t('notifications.contentPublished')}</Label>
          <p className="text-muted-foreground text-sm">{t('notifications.contentPublishedDescription')}</p>
        </div>
        <Switch
          id="pref-content-published"
          checked={prefs.contentPublished}
          onCheckedChange={(checked) => {
            setPrefs((p) => ({ ...p, contentPublished: checked }));
          }}
        />
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="pref-media-uploaded">{t('notifications.mediaUploaded')}</Label>
          <p className="text-muted-foreground text-sm">{t('notifications.mediaUploadedDescription')}</p>
        </div>
        <Switch
          id="pref-media-uploaded"
          checked={prefs.mediaUploaded}
          onCheckedChange={(checked) => {
            setPrefs((p) => ({ ...p, mediaUploaded: checked }));
          }}
        />
      </div>
    </div>
  );
}
