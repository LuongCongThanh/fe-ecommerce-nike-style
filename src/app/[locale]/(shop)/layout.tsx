import { Footer } from '@/features/storefront-shell/components/Footer';
import { Header } from '@/features/storefront-shell/components/Header';

interface ShopLayoutProps {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
}

export default async function ShopLayout({ children, params }: ShopLayoutProps) {
  const { locale } = await params;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ANTIGRAVITY.STORE',
    url: `https://antigravity.store/${locale}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://antigravity.store/${locale}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
