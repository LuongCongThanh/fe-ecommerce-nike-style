import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'use-intl';

// Danh sách các module dịch — mỗi module tương ứng một file JSON trong src/lang/{locale}/
const modules = ['common', 'auth', 'product', 'cart', 'order', 'payment', 'home', 'checkout'] as const;

// Kiểu union của tên module, dùng để type-safe khi gọi useTranslations('module')
export type MessageModule = (typeof modules)[number];

// getRequestConfig chạy trên server mỗi request — next-intl gọi hàm này để lấy locale và messages
export default getRequestConfig(async ({ requestLocale }) => {
  // Lấy locale từ URL (vd: /vi/...), fallback về 'vi' nếu không xác định được
  const locale = (await requestLocale) ?? 'vi';

  // Load song song tất cả module JSON cho locale hiện tại
  const moduleMessages = await Promise.all(
    modules.map(async (mod) => {
      // Dynamic import theo path src/lang/{locale}/{module}.json
      const messagesModule = (await import(`../lang/${locale}/${mod}.json`)) as { default: AbstractIntlMessages };
      const messages = messagesModule.default;
      return [mod, messages] as const;
    }),
  );

  // Ghép thành object { common: {...}, auth: {...}, ... } để truyền cho next-intl
  const messages = Object.fromEntries(moduleMessages);

  return { locale, messages };
});
