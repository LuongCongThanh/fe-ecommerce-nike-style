import Link from 'next/link';

import { ArrowLeft, RotateCcw, ShieldCheck, Star, Truck } from 'lucide-react';

import { AddToCartSection } from '@/app/[locale]/(shop)/_lib/components/products/AddToCartSection';
import type { ProductDisplay } from '@/app/[locale]/(shop)/_lib/types/product';
import { calculateDiscountPercent } from '@/app/[locale]/(shop)/_lib/utils/discount';
import { Badge } from '@/shared/components/base/badge';
import { cn, formatCurrency } from '@/shared/lib/utils';

const TRUST_BADGES = [
  { icon: Truck, title: 'Giao hàng nhanh', sub: '2-4 ngày làm việc' },
  { icon: RotateCcw, title: 'Đổi trả 30 ngày', sub: 'Miễn phí đổi trả' },
  { icon: ShieldCheck, title: 'Bảo hành 1 năm', sub: 'Chính hãng 100%' },
] as const;

interface ProductInfoPanelProps {
  readonly product: ProductDisplay;
  readonly locale: string;
}

export function ProductInfoPanel({ product, locale }: ProductInfoPanelProps) {
  const discount = product.salePrice !== null ? calculateDiscountPercent(product.price, product.salePrice) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Badges + name */}
      <div>
        {product.badges.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {product.badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="capitalize">
                {badge}
              </Badge>
            ))}
          </div>
        )}
        <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">{product.name}</h1>

        {/* Rating */}
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
          <span className="text-muted-foreground">·</span>
          <span className="text-success-700 text-sm">Còn hàng</span>
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-baseline gap-4">
          {product.salePrice !== null ? (
            <>
              <span className="text-brand-600 text-3xl font-bold">{formatCurrency(product.salePrice)}</span>
              <span className="text-muted-foreground text-lg line-through">{formatCurrency(product.price)}</span>
              {discount !== null && (
                <span className="bg-brand-50 text-brand-700 rounded-full px-2.5 py-0.5 text-sm font-bold">-{discount.toString()}%</span>
              )}
            </>
          ) : (
            <span className="text-brand-600 text-3xl font-bold">{formatCurrency(product.price)}</span>
          )}
        </div>
        {product.salePrice !== null && (
          <p className="text-muted-foreground mt-1.5 text-xs">Tiết kiệm {formatCurrency(product.price - product.salePrice)}</p>
        )}
      </div>

      {/* Variant + Qty + Cart */}
      <AddToCartSection product={product} />

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
