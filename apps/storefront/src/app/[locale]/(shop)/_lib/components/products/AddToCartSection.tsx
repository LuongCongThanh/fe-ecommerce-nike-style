// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · springs + instant feedback + materials (safe-mode: no new gesture code)
'use client';

import type { Sku } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, ShoppingCart, Zap } from 'lucide-react';

import { VariantSelector } from '@/app/[locale]/(shop)/_lib/components/products/VariantSelector';
import type { useAddToCart } from '@/app/[locale]/(shop)/_lib/hooks/products/useAddToCart';

type AddToCartSectionProps = ReturnType<typeof useAddToCart>;

function stockMessage(selectedSku: Sku | null): React.JSX.Element | null {
  if (selectedSku === null) return null;
  if (selectedSku.stock === 0) return <p className="text-destructive text-xs font-semibold">Hết hàng</p>;
  if (selectedSku.stock < 10) {
    return (
      <p className="text-warning-700 flex items-center gap-1.5 text-xs font-semibold">
        <span className="bg-warning-500 inline-block size-1.5 rounded-full" />
        Chỉ còn {selectedSku.stock.toString()} sản phẩm!
      </p>
    );
  }
  return null;
}

export function AddToCartSection({
  axes,
  selection,
  selectedSku,
  quantity,
  isAdded,
  maxStock,
  selectColor,
  selectSize,
  setQuantity,
  add,
  buyNow,
}: AddToCartSectionProps) {
  const canAdd = selectedSku !== null && selectedSku.stock > 0;

  return (
    <div className="space-y-8">
      <VariantSelector
        colors={axes.colors}
        sizes={axes.sizes}
        selectedColor={selection.color}
        selectedSize={selection.size}
        onSelectColor={selectColor}
        onSelectSize={selectSize}
      />

      {stockMessage(selectedSku)}

      <div>
        <h3 className="text-muted-foreground mb-4 text-sm font-bold tracking-wider uppercase">Số lượng</h3>
        <div className="flex items-center gap-4">
          <div className="border-muted-foreground/20 bg-muted/50 flex items-center rounded-xl border p-1">
            <motion.button
              type="button"
              onClick={() => {
                setQuantity((prev) => Math.max(1, prev - 1));
              }}
              whileTap={{ scale: 0.9 }}
              className="hover:bg-muted focus-visible:ring-ring flex size-11 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
              disabled={quantity <= 1}
              aria-label="Giảm số lượng"
            >
              <Minus className="size-4" />
            </motion.button>
            <span className="w-12 text-center font-bold tabular-nums">{quantity}</span>
            <motion.button
              type="button"
              onClick={() => {
                setQuantity((prev) => Math.min(maxStock, prev + 1));
              }}
              whileTap={{ scale: 0.9 }}
              className="hover:bg-muted focus-visible:ring-ring flex size-11 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
              disabled={quantity >= maxStock}
              aria-label="Tăng số lượng"
            >
              <Plus className="size-4" />
            </motion.button>
          </div>
          {maxStock > 0 && <span className="text-muted-foreground text-sm">{maxStock.toString()} sản phẩm có sẵn</span>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="default"
          size="lg"
          className="active:scale-0.97 h-12 w-full text-base transition-transform"
          onClick={buyNow}
          disabled={!canAdd}
        >
          <div className="flex items-center gap-2 font-semibold">
            <Zap className="size-5 fill-current" />
            Mua ngay
          </div>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="active:scale-0.97 relative h-12 w-full overflow-hidden text-base transition-transform"
          onClick={add}
          disabled={isAdded || !canAdd}
        >
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.div
                key="success"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <Check className="size-5" />
                Đã thêm
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="size-5" />
                Thêm vào giỏ
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}
