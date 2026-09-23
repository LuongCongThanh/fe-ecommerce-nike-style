import i18next from 'i18next';
import type { i18n as I18nInstance, Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE, isLocale, LOCALES } from './locales';

/** Shape a bundler's eager glob of `lang/<locale>/<namespace>.json` produces. */
export type MessageGlob = Record<string, unknown>;

export interface CreateI18nextOptions {
  /** Eager glob of the app's message files, e.g. `import.meta.glob('../lang/*&#47;*.json', { eager: true })`. */
  readonly messages: MessageGlob;
  /** Namespace used when a component asks for none. */
  readonly defaultNS?: string;
}

/** `.../lang/<locale>/<namespace>.json` → the locale and namespace it declares. */
function parsePath(path: string): { locale: string; namespace: string } | null {
  const match = /\/lang\/(?<locale>[^/]+)\/(?<namespace>[^/]+)\.json$/.exec(path);
  if (match?.groups === undefined) return null;
  const { locale, namespace } = match.groups;
  return { locale, namespace };
}

function unwrap(module: unknown): unknown {
  return typeof module === 'object' && module !== null && 'default' in module ? module.default : module;
}

/**
 * Turns a glob of message files into i18next `resources`, keyed `{ [locale]: { [namespace]: … } }`.
 * Each app used to spell this out by hand — two static imports and two `resources` entries per
 * namespace, four mentions of every namespace name, with nothing catching a locale you forgot.
 */
export function buildResources(messages: MessageGlob): Resource {
  const resources: Resource = {};

  for (const [path, module] of Object.entries(messages)) {
    const parsed = parsePath(path);
    if (parsed === null || !isLocale(parsed.locale)) continue;
    resources[parsed.locale] ??= {};
    (resources[parsed.locale] as Record<string, unknown>)[parsed.namespace] = unwrap(module);
  }

  return resources;
}

/**
 * Every namespace must exist for every locale in {@link LOCALES}. A namespace present in one locale
 * and missing in another used to fall back silently at runtime, so the gap only showed up as English
 * text on a Vietnamese screen; this fails loudly at startup instead.
 */
export function assertLocaleParity(resources: Resource): void {
  const namespaces = new Set(Object.values(resources).flatMap((byNamespace) => Object.keys(byNamespace as object)));

  const missing = LOCALES.flatMap((locale) =>
    [...namespaces].filter((namespace) => !(namespace in ((resources[locale] ?? {}) as object))).map((namespace) => `${locale}/${namespace}`),
  );

  if (missing.length > 0) {
    throw new Error(`[@repo/i18n] missing message files: ${missing.join(', ')}`);
  }
}

/**
 * The i18next setup shared by the Vite apps (admin, cms): discover namespaces from a message glob,
 * check locale parity, and initialise `react-i18next`. Vietnamese is the default; English is the
 * fallback.
 */
export function createI18next({ messages, defaultNS = 'common' }: CreateI18nextOptions): I18nInstance {
  const resources = buildResources(messages);
  assertLocaleParity(resources);

  void i18next.use(initReactI18next).init({
    lng: DEFAULT_LOCALE,
    fallbackLng: LOCALES.filter((locale) => locale !== DEFAULT_LOCALE),
    defaultNS,
    interpolation: { escapeValue: false },
    resources,
  });

  return i18next;
}
