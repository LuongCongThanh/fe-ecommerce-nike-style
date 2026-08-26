import { LOCALES } from '@repo/i18n/locales';
import { createNavigation } from 'next-intl/navigation';

// Locale-aware drop-ins for next/navigation — keeps client navigation on the current locale
// instead of bouncing to DEFAULT_LOCALE via the middleware's redirect.
export const { Link, redirect, usePathname, useRouter } = createNavigation({ locales: LOCALES });
