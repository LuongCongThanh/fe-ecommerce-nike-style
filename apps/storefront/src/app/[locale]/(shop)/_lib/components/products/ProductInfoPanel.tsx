import dynamic from 'next/dynamic';
import Link from 'next/link';

import type { Product } from '@repo/schemas/catalog';
import { cn, formatCurrency } from '@repo/shared/utils';
import { ArrowLeft, RotateCcw, ShieldCheck, Star, Truck } from 'lucide-react';

import { AddToCartSection } from '@/app/[locale]/(shop)/_lib/components/products/AddToCartSection';
import { useAddToCart } from '@/app/[locale]/(shop)/_lib/hooks/products/useAddToCart';
import { getProductPriceRange } from '@/app/[locale]/(shop)/_lib/utils/priceRange';

// Decision #59 / FE-ARCHITECTURE.md §4.1.1 — three.js only ever loads for a mounted PDP, never at a
// higher-level route/layout, and never during SSR (WebGL has no server-side renderer).
const ProductViewer3D = dynamic(async () => import('@/app/[locale]/(shop)/_lib/components/products/ProductViewer3D'), {
  ssr: false,
  loading: () => <div className="bg-muted aspect-square w-full animate-pulse rounded-xl" />,
});

const TRUST_BADGES = [
  { icon: Truck, title: 'Giao hàng nhanh', sub: '2-4 ngày làm việc' },
  { icon: RotateCcw, title: 'Đổi trả 30 ngày', sub: 'Miễn phí đổi trả' },
  { icon: ShieldCheck, title: 'Bảo hành 1 năm', sub: 'Chính hãng 100%' },
] as const;

interface ProductInfoPanelProps {
  readonly product: Product;
  readonly locale: string;
}

export function ProductInfoPanel({ product, locale }: ProductInfoPanelProps) {
  const cartState = useAddToCart(product);
  const { selectedSku, selection } = cartState;
  const { min: priceFrom, isRange } = getProductPriceRange(product);
  const displayPrice = selectedSku?.price ?? priceFrom;

  return (
    <div className="flex flex-col gap-6">
      {/* Name + rating */}
      <div>
        <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">{product.name}</h1>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`star-${i.toString()}`}
                className={cn('size-4', i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300')}
              />
            ))}
          </div>
          <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
          <span className="text-muted-foreground text-sm">({product.reviewCount.toString()} đánh giá)</span>
        </div>
      </div>

      {/* 3D viewer — lazy, synced to the selected Color */}
      <ProductViewer3D color={selection.color ?? null} />

      {/* Price */}
      <div>
        <span className="text-brand-600 text-3xl font-bold">
          {selectedSku === null && isRange ? <span className="text-muted-foreground mr-1.5 text-base font-normal">Từ</span> : null}
          {formatCurrency(displayPrice)}
        </span>
        {selectedSku === null && (product.skus.length > 1 || isRange) ? (
          <p className="text-muted-foreground mt-1.5 text-xs">Chọn phân loại để xem giá và tồn kho chính xác</p>
        ) : null}
      </div>

      {/* Variant + Qty + Cart */}
      <AddToCartSection {...cartState} />

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 border-t pt-6">
        {TRUST_BADGES.map((item) => (
          <div key={item.title} className="flex flex-col items-center gap-2 rounded-xl border p-3 text-center">
            <div className="bg-muted text-foreground flex size-9 items-center justify-center rounded-full">
              <item.icon className="size-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold">{item.title}</p>
              <p className="text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Back link */}
      <Link
        href={`/${locale}/products`}
        className="text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="size-4" />
        Quay lại danh sách sản phẩm
      </Link>
    </div>
  );
}
