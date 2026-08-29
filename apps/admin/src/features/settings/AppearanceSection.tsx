import { Label } from '@repo/ui/label';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { LOCALES, type Locale } from '@repo/i18n/locales';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

/** Consolidates the header's `ThemeToggle`/`LanguageSwitcher` into one settings page — both are
 * real, already-working controls (next-themes / i18next), not new state. */
export function AppearanceSection(): React.JSX.Element {
  const { t, i18n } = useTranslation('settings');
  const { resolvedTheme, setTheme } = useTheme();
  const activeLocale = i18n.language as Locale;

  const localeLabel: Record<Locale, string> = {
    vi: 'Tiếng Việt',
    en: 'English',
  };

  return (
    <div className="max-w-md space-y-8">
      <p className="text-muted-foreground text-sm">{t('appearance.description')}</p>

      <div className="space-y-3">
        <Label>{t('appearance.theme')}</Label>
        <RadioGroup
          value={resolvedTheme ?? 'light'}
          onValueChange={(value) => {
            setTheme(value);
          }}
          className="flex gap-6"
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="light" />
            {t('appearance.themeLight')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="dark" />
            {t('appearance.themeDark')}
          </label>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>{t('appearance.language')}</Label>
        <RadioGroup
          value={activeLocale}
          onValueChange={(value) => {
            void i18n.changeLanguage(value);
          }}
          className="flex gap-6"
        >
          {LOCALES.map((locale) => (
            <label key={locale} className="flex items-center gap-2 text-sm">
              <RadioGroupItem value={locale} />
              {localeLabel[locale]}
            </label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
