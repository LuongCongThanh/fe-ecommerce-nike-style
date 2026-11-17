const INTL_LOCALE = { vi: 'vi-VN', en: 'en-GB' } as const;
const FALLBACK_INTL_LOCALE = INTL_LOCALE.vi;

type AppLocale = keyof typeof INTL_LOCALE;

export interface FormatOrderDateOptions {
  readonly withTime?: boolean;
  readonly timeZone?: string;
}

function isAppLocale(locale: string): locale is AppLocale {
  return Object.hasOwn(INTL_LOCALE, locale);
}

function toIntlLocale(locale: string): string {
  return isAppLocale(locale) ? INTL_LOCALE[locale] : FALLBACK_INTL_LOCALE;
}

/**
 * Formats an order timestamp for the app locale. Returns an empty string for an unparsable ISO value
 * so the UI never renders "Invalid Date". Time is 24h without seconds.
 */
export function formatOrderDate(iso: string, locale: string, options: FormatOrderDateOptions = {}): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const formatOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  if (options.withTime === true) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
    formatOptions.hourCycle = 'h23';
  }
  // Không truyền timeZone thì dùng múi giờ của trình duyệt, giống toLocale*String trước đây.
  if (options.timeZone !== undefined) {
    formatOptions.timeZone = options.timeZone;
  }

  return new Intl.DateTimeFormat(toIntlLocale(locale), formatOptions).format(date);
}
