import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { AppProviders } from '@/providers/app-providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Admin',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Root layout nằm ngoài segment [locale] nên không nhận được nó qua `params` — dùng `getLocale()`
  // của next-intl (đọc locale mà `middleware.ts` đã xác định cho request hiện tại) để khai đúng <html lang>.
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
