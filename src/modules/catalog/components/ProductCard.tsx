// Apple Design pass · §1 the card responds on pointer-down, not on release
'use client';

import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { resolveDiscount } from '@/modules/catalog/discount';
import type { BadgeValue } from '@/modules/catalog/types/badge.types';
import { Badge } from '@/shared/components/Badge';
import { formatCurrency } from '@/shared/formatting/currency';
import { SPRING_UI } from '@/shared/styles/motion';

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
  /** Product's SKUs diverge in price — render "Từ {price}" instead of a single price (glossary.md — SKU). */
  readonly isPriceRange?: boolean;
  /** Optional overlay slot (e.g. a wishlist heart) composed by the caller; absolutely positioned inside the card. Omit for no action. */
  readonly wishlistAction?: React.ReactNode;
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
  isPriceRange = false,
  wishlistAction,
}: ProductCardProps): React.JSX.Element {
  const t = useTranslations('product');
  const { hasDiscount, finalPrice: displayPrice } = resolveDiscount(price, salePrice);
  const coverImage = images[0] ?? '/images/products/placeholder.jpg';
  const resolvedBadgeLabels = { ...DEFAULT_BADGE_LABELS, ...badgeLabels };

  return (
    <div className="group relative">
      <Link
        href={`/${locale}/products/${slug}`}
        className="focus-visible:ring-ring block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        data-product-id={String(id)}
      >
        <motion.div
          whileTap={{ scale: 0.975 }}
          transition={SPRING_UI}
          className="bg-card group-hover:border-foreground/30 overflow-hidden rounded-xl border shadow-sm transition-[box-shadow,border-color] duration-(--duration-normal) ease-out group-hover:shadow-md"
        >
          {/* Image */}
          <div className="bg-muted relative aspect-[4/5] overflow-hidden">
            <Image
              src={coverImage}
              alt={name}
              fill
              className="object-cover transition-transform duration-(--duration-normal) ease-out group-hover:-translate-y-0.5"
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
              <span className="text-brand-600 text-lg font-bold tabular-nums">
                {isPriceRange ? <span className="text-muted-foreground mr-1 text-xs font-normal normal-case">{t('fromPrice')}</span> : null}
                {formatCurrency(displayPrice, locale)}
              </span>
              {hasDiscount ? <span className="text-muted-foreground text-xs tabular-nums line-through">{formatCurrency(price, locale)}</span> : null}
            </div>

            {rating != null ? (
              <div className="mt-1 flex items-center gap-1 border-t pt-3">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span className="text-foreground text-xs font-bold tabular-nums">{rating.toFixed(1)}</span>
                {reviewCount != null && reviewCount > 0 ? (
                  <span className="text-muted-foreground text-[10px] tabular-nums">({reviewCount})</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </motion.div>
      </Link>

      {wishlistAction}
    </div>
  );
}
