'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Star } from 'lucide-react';

import { Badge } from '@/shared/components/base/badge';
import { formatCurrency } from '@/shared/lib/utils';
import type { BadgeValue } from '@/shared/types/product';

interface BadgeLabels {
  'best-seller': string;
  new: string;
  sale: string;
  'low-stock': string;
}

interface ProductCardProps {
  readonly id: number | string;
  readonly name: string;
  readonly slug: string;
  readonly price: number;
  readonly salePrice?: number | null;
  readonly images: string[];
  readonly rating?: number;
  readonly reviewCount?: number;
  readonly badges?: BadgeValue[];
  readonly locale: string;
  readonly badgeLabels?: Partial<BadgeLabels>;
}

const BADGE_VARIANTS: Record<BadgeValue, 'warning' | 'info' | 'brand'> = {
  'best-seller': 'warning',
  new: 'info',
  sale: 'brand',
  'low-stock': 'warning',
};

const DEFAULT_BADGE_LABELS: BadgeLabels = {
  'best-seller': 'Bán chạy',
  new: 'Mới',
  sale: 'Giảm giá',
  'low-stock': 'Sắp hết',
};

export function ProductCard({
  id,
  name,
  slug,
  price,
  salePrice,
  images,
  rating,
  reviewCount,
  badges,
  locale,
  badgeLabels,
}: ProductCardProps): React.JSX.Element {
  const hasDiscount = typeof salePrice === 'number' && salePrice > 0 && salePrice < price;
  const displayPrice = hasDiscount ? salePrice : price;
  const coverImage = images[0] ?? '/placeholder-product.png';
  const resolvedBadgeLabels = { ...DEFAULT_BADGE_LABELS, ...badgeLabels };

  return (
    <Link href={`/${locale}/products/${slug}`} className="group block" data-product-id={String(id)}>
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="bg-muted relative aspect-square overflow-hidden">
          <Image
            src={coverImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {badges != null && badges.length > 0 ? (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <Badge key={badge} variant={BADGE_VARIANTS[badge]} className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                  {resolvedBadgeLabels[badge]}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 p-4">
          <p className="text-foreground line-clamp-2 text-sm leading-tight font-medium">{name}</p>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-brand-600 text-lg font-bold">{formatCurrency(displayPrice)}</span>
            {hasDiscount ? <span className="text-muted-foreground text-xs line-through">{formatCurrency(price)}</span> : null}
          </div>

          {rating != null ? (
            <div className="mt-1 flex items-center gap-1 border-t pt-3">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="text-foreground text-xs font-bold">{rating.toFixed(1)}</span>
              {reviewCount != null && reviewCount > 0 ? <span className="text-muted-foreground text-[10px]">({reviewCount})</span> : null}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
