import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { LOCALES, type Locale } from '@repo/i18n/locales';
import { Check, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LOCALE_LABEL: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

/**
 * Real vi/en switch — admin genuinely serves both locales, it just wasn't exposed anywhere in the
 * UI yet. Unlike the Next.js version (locale-prefixed routes, next-intl's locale-aware router),
 * this app has no URL locale segment — `i18n.changeLanguage` just swaps the active language
 * in-place, no navigation involved.
 */
export function LanguageSwitcher(): React.JSX.Element {
  const { t, i18n } = useTranslation('common');
  const activeLocale = i18n.language as Locale;

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
              void i18n.changeLanguage(locale);
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
