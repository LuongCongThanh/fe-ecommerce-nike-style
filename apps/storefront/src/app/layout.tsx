import { Be_Vietnam_Pro, Inter } from 'next/font/google';

import type { Metadata, Viewport } from 'next';

import { Providers } from '@/app/providers';
import { cn } from '@/shared/lib/utils';

import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['900'],
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
    <html lang="vi" suppressHydrationWarning className={cn(inter.variable, beVietnamPro.variable)}>
      <body className="selection:bg-brand-500/30 font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <div className="relative flex min-h-screen flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
