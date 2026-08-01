'use client';

import Image from 'next/image';

import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

import { QuantitySelector } from '@/app/[locale]/(shop)/_lib/components/common/QuantitySelector';
import type { CartItem } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { Button } from '@/shared/components/base/button';
import { formatCurrency } from '@/shared/lib/utils';

export function CartTable() {
  const { items, updateQuantity, removeCartItem } = useCart();

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground hidden grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b pb-3 text-xs font-semibold tracking-wider uppercase sm:grid">
        <span>Sản phẩm</span>
        <span className="text-center">Đơn giá</span>
        <span className="text-center">Số lượng</span>
        <span className="text-right">Tổng</span>
      </div>

      <AnimatePresence initial={false}>
        {items.map((item) => (
          <CartRow
            key={item.variantId}
            item={item}
            onUpdateQty={(qty: number) => {
              updateQuantity(item.variantId, qty);
            }}
            onRemove={() => {
              removeCartItem(item.variantId);
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface CartRowProps {
  readonly item: CartItem;
  readonly onUpdateQty: (qty: number) => void;
  readonly onRemove: () => void;
}

function CartRow({ item, onUpdateQty, onRemove }: CartRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card rounded-xl border p-4 shadow-sm"
    >
      <div className="flex gap-4">
        <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-lg">
          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
        </div>

        <div className="flex flex-1 flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="line-clamp-1 font-semibold">{item.name}</p>
              {item.variantName !== undefined && item.variantName.length > 0 && (
                <p className="text-muted-foreground mt-0.5 text-xs">{item.variantName}</p>
              )}
              <p className="text-brand-600 mt-1 text-sm font-bold sm:hidden">{formatCurrency(item.price)}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label="Xóa sản phẩm"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <QuantitySelector value={item.quantity} min={1} max={99} onChange={onUpdateQty} />

            <div className="text-right">
              <p className="text-muted-foreground hidden text-xs sm:block">
                {formatCurrency(item.price)} × {item.quantity}
              </p>
              <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
