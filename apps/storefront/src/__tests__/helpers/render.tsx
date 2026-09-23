import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'use-intl';

import address from '@/lang/vi/address.json';
import auth from '@/lang/vi/auth.json';
import cart from '@/lang/vi/cart.json';
import checkout from '@/lang/vi/checkout.json';
import common from '@/lang/vi/common.json';
import home from '@/lang/vi/home.json';
import order from '@/lang/vi/order.json';
import payment from '@/lang/vi/payment.json';
import product from '@/lang/vi/product.json';
import profile from '@/lang/vi/profile.json';
import wishlist from '@/lang/vi/wishlist.json';

// Charge toàn bộ namespace `vi` thật (không phải `{}`) để component gọi `useTranslations` render
// đúng nội dung catalog thay vì rơi về key thô — khớp với danh sách module ở `src/i18n/request.ts`.
// Cast giống `src/i18n/request.ts`: JSON tĩnh (vd. mảng string trong `home.json`) không khớp hoàn
// toàn index signature của `AbstractIntlMessages`, nhưng đây đúng là shape next-intl chấp nhận runtime.
const messages = { common, auth, product, cart, order, payment, home, checkout, wishlist, profile, address } as unknown as AbstractIntlMessages;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function Providers({ children }: { readonly children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <NextIntlClientProvider locale="vi" messages={messages}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextIntlClientProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...options });
}
