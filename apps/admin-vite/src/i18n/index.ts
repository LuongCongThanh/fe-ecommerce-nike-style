import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Ported from next-intl's per-namespace JSON files (apps/admin's old src/lang/{en,vi}/*.json —
// each file was a next-intl "namespace" like `useTranslations('order')`). i18next uses the same
// namespace concept, so each filename becomes an i18next namespace and the JSON content carries
// over unchanged.
import enAuth from '@/lang/en/auth.json';
import enCategory from '@/lang/en/category.json';
import enCommon from '@/lang/en/common.json';
import enInventory from '@/lang/en/inventory.json';
import enOrder from '@/lang/en/order.json';
import enProduct from '@/lang/en/product.json';
import enStaff from '@/lang/en/staff.json';
import viAuth from '@/lang/vi/auth.json';
import viCategory from '@/lang/vi/category.json';
import viCommon from '@/lang/vi/common.json';
import viInventory from '@/lang/vi/inventory.json';
import viOrder from '@/lang/vi/order.json';
import viProduct from '@/lang/vi/product.json';
import viStaff from '@/lang/vi/staff.json';

export const defaultNS = 'common';

void i18n.use(initReactI18next).init({
  lng: 'vi',
  fallbackLng: 'en',
  defaultNS,
  interpolation: { escapeValue: false },
  resources: {
    en: { common: enCommon, auth: enAuth, category: enCategory, inventory: enInventory, order: enOrder, product: enProduct, staff: enStaff },
    vi: { common: viCommon, auth: viAuth, category: viCategory, inventory: viInventory, order: viOrder, product: viProduct, staff: viStaff },
  },
});

export default i18n;
