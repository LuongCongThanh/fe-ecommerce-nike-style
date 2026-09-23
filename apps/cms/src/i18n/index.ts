import { createI18next } from '@repo/i18n/i18next';

// See apps/admin/src/i18n/index.ts — namespaces are discovered from `src/lang/<locale>/*.json`.
const messages = import.meta.glob('@/lang/*/*.json', { eager: true });

export const defaultNS = 'common';

export default createI18next({ messages, defaultNS });
