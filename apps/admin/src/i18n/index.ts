import { createI18next } from '@repo/i18n/i18next';

// Namespaces are discovered from the files themselves: every `src/lang/<locale>/<namespace>.json`
// becomes an i18next namespace (the same concept next-intl called a namespace, so the JSON carried
// over unchanged when this app left next-intl). Adding a namespace means adding the two JSON files
// and nothing else — `createI18next` throws at startup if one locale is missing a file the other has.
const messages = import.meta.glob('@/lang/*/*.json', { eager: true });

export const defaultNS = 'common';

export default createI18next({ messages, defaultNS });
