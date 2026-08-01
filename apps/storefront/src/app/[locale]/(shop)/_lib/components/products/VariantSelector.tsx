'use client';

import type { SizeOption } from '@/app/[locale]/(shop)/_lib/types/product';
import { cn } from '@/shared/lib/utils';

interface VariantSelectorProps {
  readonly variants: SizeOption[];
  readonly selectedVariant: SizeOption | null;
  readonly onSelect: (variant: SizeOption) => void;
}

export function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps): React.JSX.Element | null {
  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Phân loại</h3>
        {selectedVariant !== null && <span className="text-sm font-semibold">{selectedVariant.label}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isOutOfStock = variant.stock === 0;
          const isSelected = selectedVariant?.id === variant.id;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => {
                if (!isOutOfStock) {
                  onSelect(variant);
                }
              }}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? `${variant.label} - hết hàng` : variant.label}
              className={cn(
                'relative min-w-13 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                isSelected && !isOutOfStock
                  ? 'border-foreground ring-foreground ring-1'
                  : !isOutOfStock
                    ? 'hover:border-foreground'
                    : 'cursor-not-allowed line-through opacity-40',
              )}
            >
              {variant.label}
              {isOutOfStock ? <span className="sr-only"> (Hết hàng)</span> : null}
            </button>
          );
        })}
      </div>

      {selectedVariant !== null && selectedVariant.stock > 0 && selectedVariant.stock < 10 && (
        <p className="text-warning-700 flex items-center gap-1.5 text-xs font-semibold">
          <span className="bg-warning-500 inline-block size-1.5 rounded-full" />
          Chỉ còn {selectedVariant.stock.toString()} sản phẩm!
        </p>
      )}
    </div>
  );
}
