'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { LOCALES, type Locale } from '@repo/i18n/locales';
import { Check, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

const LOCALE_LABEL: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

/**
 * Real vi/en switch — admin genuinely serves both locales (`LOCALES`, `ADMIN_LOCALE` cookie via
 * `middleware.ts`'s `createIntlMiddleware`), it just wasn't exposed anywhere in the UI yet. Swaps
 * the current route to the other locale via next-intl's locale-aware router, so you land on the
 * same page (e.g. `/en/orders`, not back to the dashboard).
 */
export function LanguageSwitcher(): React.JSX.Element {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const activeLocale = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('languageSwitcher')}
          className="flex size-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:size-11 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <Globe className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() => {
              router.replace(pathname, { locale });
            }}
          >
            {LOCALE_LABEL[locale]}
            {locale === activeLocale ? <Check className="ml-auto size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
