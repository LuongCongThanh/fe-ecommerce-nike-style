// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
'use client';

import { ShoppingCart } from 'lucide-react';

import { VariantSelector } from '@/app/[locale]/(shop)/_lib/components/products/VariantSelector';
import type { VariantSelectionState } from '@/app/[locale]/(shop)/_lib/hooks/products/useVariantSelection';
import { Button } from '@/components/ui/Button';

type AddToCartSectionProps = Pick<VariantSelectionState, 'colors' | 'sizes' | 'colorCode' | 'sizeCode' | 'selectColor' | 'selectSize'>;

/**
 * Variant picker plus the buy action. Ordering opens with slice C (stock, server Cart); until then the
 * button stays disabled and says so, instead of adding to a Cart that cannot be checked out.
 */
export function AddToCartSection({ colors, sizes, colorCode, sizeCode, selectColor, selectSize }: AddToCartSectionProps) {
  return (
    <div className="space-y-8">
      <VariantSelector
        colors={colors.map((c) => ({ value: c.code, label: c.name }))}
        sizes={sizes.map((s) => ({ value: s.code, label: s.name }))}
        selectedColor={colorCode}
        selectedSize={sizeCode}
        onSelectColor={selectColor}
        onSelectSize={selectSize}
      />

      <div className="space-y-2">
        <Button variant="default" size="lg" className="h-12 w-full text-base" disabled data-testid="add-to-cart">
          <span className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="size-5" />
            Sắp mở bán
          </span>
        </Button>
        <p className="text-muted-foreground text-center text-xs">Đặt hàng trực tuyến sẽ sớm được mở.</p>
      </div>
    </div>
  );
}
