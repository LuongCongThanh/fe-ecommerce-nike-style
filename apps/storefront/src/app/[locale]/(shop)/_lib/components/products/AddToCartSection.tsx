'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, ShoppingCart, Zap } from 'lucide-react';

import { VariantSelector } from '@/app/[locale]/(shop)/_lib/components/products/VariantSelector';
import { useAddToCart } from '@/app/[locale]/(shop)/_lib/hooks/products/useAddToCart';
import type { ProductDisplay } from '@/app/[locale]/(shop)/_lib/types/product';
import { Button } from '@/shared/components/base/button';

interface AddToCartSectionProps {
  readonly product: ProductDisplay;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const { selectedVariant, quantity, isAdded, maxStock, selectVariant, setQuantity, add, buyNow } = useAddToCart(product);

  return (
    <div className="space-y-8">
      {product.variants.length > 0 && <VariantSelector variants={product.variants} selectedVariant={selectedVariant} onSelect={selectVariant} />}

      <div>
        <h3 className="text-muted-foreground mb-4 text-sm font-bold tracking-wider uppercase">Số lượng</h3>
        <div className="flex items-center gap-4">
          <div className="border-muted-foreground/20 bg-muted/50 flex items-center rounded-xl border p-1">
            <button
              type="button"
              onClick={() => {
                setQuantity((prev) => Math.max(1, prev - 1));
              }}
              className="hover:bg-muted flex size-11 items-center justify-center rounded-lg transition-colors"
              disabled={quantity <= 1}
              aria-label="Giảm số lượng"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-12 text-center font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => {
                setQuantity((prev) => Math.min(maxStock, prev + 1));
              }}
              className="hover:bg-muted flex size-11 items-center justify-center rounded-lg transition-colors"
              disabled={quantity >= maxStock}
              aria-label="Tăng số lượng"
            >
              <Plus className="size-4" />
            </button>
          </div>
          {maxStock > 0 && <span className="text-muted-foreground text-sm">{maxStock.toString()} sản phẩm có sẵn</span>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="default" size="lg" className="h-12 w-full text-base" onClick={buyNow} disabled={maxStock === 0}>
          <div className="flex items-center gap-2 font-semibold">
            <Zap className="size-5 fill-current" />
            Mua ngay
          </div>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="relative h-12 w-full overflow-hidden text-base"
          onClick={add}
          disabled={isAdded || maxStock === 0}
        >
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.div
                key="success"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
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
