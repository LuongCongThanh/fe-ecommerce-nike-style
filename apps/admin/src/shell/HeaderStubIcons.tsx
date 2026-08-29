import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/tooltip';
import { Bell, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Header icons with no real feature behind them yet — an app-switcher (no real cross-app launcher
 * wired up) and notifications (no notification data source exists). Rather than drop them (prior
 * pass) or fake them working, they're disabled + tooltipped — the same honest treatment as the login
 * page's social buttons: present in the layout, visibly inert, no invented unread count or badge.
 * (Language switching used to live here too — it turned out to be a real, already-wired feature
 * `LanguageSwitcher` just wasn't exposing, so it moved out of the stub list.)
 */
export function HeaderStubIcons(): React.JSX.Element {
  const { t } = useTranslation('common');

  const stubs = [
    { key: 'apps', icon: LayoutGrid, label: t('appsSwitcher') },
    { key: 'notifications', icon: Bell, label: t('notifications') },
  ] as const;

  return (
    <TooltipProvider>
      {stubs.map(({ key, icon: Icon, label }) => (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <span>
              <button
                type="button"
                disabled
                aria-disabled="true"
                aria-label={label}
                className="flex size-10 cursor-not-allowed items-center justify-center rounded-full text-gray-400 opacity-60 lg:size-11 dark:text-gray-500"
              >
                <Icon className="size-5" />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent>{t('notAvailableYet')}</TooltipContent>
        </Tooltip>
      ))}
    </TooltipProvider>
  );
}
