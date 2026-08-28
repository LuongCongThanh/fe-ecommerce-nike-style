import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Ported from next-intl's per-namespace JSON files (apps/cms's old src/lang/{en,vi}/*.json).
import enAuth from '@/lang/en/auth.json';
import enCommon from '@/lang/en/common.json';
import viAuth from '@/lang/vi/auth.json';
import viCommon from '@/lang/vi/common.json';

export const defaultNS = 'common';

void i18n.use(initReactI18next).init({
  lng: 'vi',
  fallbackLng: 'en',
  defaultNS,
  interpolation: { escapeValue: false },
  resources: {
    en: { common: enCommon, auth: enAuth },
    vi: { common: viCommon, auth: viAuth },
  },
});

export default i18n;
