import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

import { ProductGrid } from '@/app/[locale]/(shop)/_lib/components/common/ProductGrid';
import { PageShell } from '@/app/[locale]/(shop)/_lib/components/layout/PageShell';
import { ProductDetailTabs } from '@/app/[locale]/(shop)/_lib/components/products/ProductDetailTabs';
import { ProductGallery } from '@/app/[locale]/(shop)/_lib/components/products/ProductGallery';
import { ProductInfoPanel } from '@/app/[locale]/(shop)/_lib/components/products/ProductInfoPanel';
import { getProductBySlug } from '@/app/[locale]/(shop)/_lib/queries/product';

interface ProductPageProps {
  readonly params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = getProductBySlug(slug);

  if (product === null) return { title: 'Product Not Found' };

  return {
    title: `${product.name} | ANTIGRAVITY.STORE`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const { product, relatedProducts } = getProductBySlug(slug);

  if (product === null) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { '@type': 'Brand', name: 'Antigravity' },
    offers: {
      '@type': 'Offer',
      url: `https://antigravity.store/${locale}/products/${slug}`,
      priceCurrency: 'VND',
      price: product.salePrice ?? product.price,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <PageShell.Browse className="min-h-screen pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="text-muted-foreground mb-8 flex items-center gap-1.5 text-sm">
        <Link href={`/${locale}/home`} className="hover:text-foreground transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/${locale}/products`} className="hover:text-foreground transition-colors">
          Sản phẩm
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/${locale}/categories/${product.categorySlug}`} className="hover:text-foreground capitalize transition-colors">
          {product.categorySlug}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Right: Info */}
        <ProductInfoPanel product={product} locale={locale} />
      </div>

      {/* Tabs: Description / Specs / Reviews */}
      <div className="mt-16">
        <ProductDetailTabs description={product.description} rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Sản phẩm liên quan</h2>
            <Link
              href={`/${locale}/categories/${product.categorySlug}`}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Xem tất cả <ChevronRight className="size-4" />
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </PageShell.Browse>
  );
}
