import { createRequestConfig } from '@repo/i18n/request-config';
import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'use-intl';

// Danh sách các module dịch — mỗi module tương ứng một file JSON trong src/lang/{locale}/
const modules = ['common', 'auth', 'product', 'cart', 'order', 'payment', 'home', 'checkout'] as const;

// Kiểu union của tên module, dùng để type-safe khi gọi useTranslations('module')
export type MessageModule = (typeof modules)[number];

// Việc load/merge messages do `@repo/i18n` sở hữu (dùng chung với admin/cms); app chỉ khai báo
// danh sách module và cách import file JSON của chính nó — đường dẫn động phải nằm ở đây để
// bundler phân giải được.
export default getRequestConfig(
  createRequestConfig(modules, async (locale, moduleName) => {
    const messagesModule = (await import(`../lang/${locale}/${moduleName}.json`)) as { default: AbstractIntlMessages };
    return messagesModule.default;
  }),
);
