import type { AbstractIntlMessages } from 'use-intl';

import { DEFAULT_LOCALE } from './locales';

export type LoadMessages = (locale: string, moduleName: string) => Promise<AbstractIntlMessages>;

export interface RequestConfigParams {
  requestLocale: Promise<string | undefined>;
}

export interface RequestConfigResult {
  locale: string;
  messages: Record<string, AbstractIntlMessages>;
}

/**
 * Builds the `getRequestConfig` resolver `next-intl` calls per request — loads every message
 * module for the resolved locale (falling back to {@link DEFAULT_LOCALE}) and merges them under
 * their module name, e.g. `{ common: {...}, auth: {...} }`.
 */
export function createRequestConfig(
  modules: readonly string[],
  loadMessages: LoadMessages,
): (params: RequestConfigParams) => Promise<RequestConfigResult> {
  return async ({ requestLocale }) => {
    const locale = (await requestLocale) ?? DEFAULT_LOCALE;

    const moduleMessages = await Promise.all(modules.map(async (moduleName) => [moduleName, await loadMessages(locale, moduleName)] as const));

    return { locale, messages: Object.fromEntries(moduleMessages) };
  };
}
