import { Be_Vietnam_Pro } from 'next/font/google';

import { cn } from '@repo/shared/utils';
import type { Metadata, Viewport } from 'next';

import { Providers } from '@/app/providers';

import '@/app/globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#e85d04',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'E-Commerce Shop', template: '%s | E-Commerce Shop' },
  description: 'Mua sắm trực tuyến nhanh chóng, tiện lợi',
  manifest: '/manifest.json',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: 'E-Commerce Shop',
    description: 'Mua sắm trực tuyến nhanh chóng, tiện lợi',
    locale: 'vi_VN',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'E-Commerce Shop',
  },
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={cn(beVietnamPro.variable)}>
      <body className="selection:bg-brand-500/30 font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <div className="relative flex min-h-screen flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
