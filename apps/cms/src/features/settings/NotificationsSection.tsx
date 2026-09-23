import { useLocalStorage } from '@repo/shared/hooks/useLocalStorage';
import { ToggleSettingsList } from '@repo/ui/toggle-settings-list';
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
    <ToggleSettingsList
      description={t('notifications.description')}
      items={[
        {
          id: 'pref-content-published',
          checked: prefs.contentPublished,
          label: t('notifications.contentPublished'),
          description: t('notifications.contentPublishedDescription'),
          onCheckedChange: (checked) => {
            setPrefs((p) => ({ ...p, contentPublished: checked }));
          },
        },
        {
          id: 'pref-media-uploaded',
          checked: prefs.mediaUploaded,
          label: t('notifications.mediaUploaded'),
          description: t('notifications.mediaUploadedDescription'),
          onCheckedChange: (checked) => {
            setPrefs((p) => ({ ...p, mediaUploaded: checked }));
          },
        },
      ]}
    />
  );
}
