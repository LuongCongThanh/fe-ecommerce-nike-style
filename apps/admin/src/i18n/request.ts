import { createRequestConfig } from '@repo/i18n/request-config';
import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'use-intl';

// Danh sách các module dịch — mỗi module tương ứng một file JSON trong src/lang/{locale}/
const MODULES = ['common', 'auth', 'staff', 'product', 'category', 'inventory', 'order'] as const;

export type MessageModule = (typeof MODULES)[number];

async function loadMessages(locale: string, moduleName: string): Promise<AbstractIntlMessages> {
  const messagesModule = (await import(`../lang/${locale}/${moduleName}.json`)) as { default: AbstractIntlMessages };
  return messagesModule.default;
}

export default getRequestConfig(createRequestConfig(MODULES, loadMessages));
