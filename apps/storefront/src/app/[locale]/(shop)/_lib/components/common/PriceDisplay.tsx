import { calculateDiscountPercent } from '@/app/[locale]/(shop)/_lib/utils/discount';
import { cn, formatCurrency } from '@/shared/lib/utils';

interface PriceDisplayProps {
  readonly price: number;
  readonly salePrice?: number | null;
  readonly className?: string;
  readonly showDiscountBadge?: boolean;
}

export function PriceDisplay({ price, salePrice, className, showDiscountBadge = false }: PriceDisplayProps): React.JSX.Element {
  const hasDiscount = typeof salePrice === 'number' && salePrice > 0 && salePrice < price;
  const finalPrice = hasDiscount ? salePrice : price;
  const discountPercent = hasDiscount ? calculateDiscountPercent(price, salePrice) : 0;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-brand-600 text-base font-bold">{formatCurrency(finalPrice)}</span>
      {hasDiscount ? <span className="text-muted-foreground text-sm line-through">{formatCurrency(price)}</span> : null}
      {hasDiscount && showDiscountBadge && discountPercent > 0 ? (
        <span className="bg-brand-50 text-brand-700 rounded-full px-2 py-0.5 text-xs font-medium">-{discountPercent}%</span>
      ) : null}
    </div>
  );
}
