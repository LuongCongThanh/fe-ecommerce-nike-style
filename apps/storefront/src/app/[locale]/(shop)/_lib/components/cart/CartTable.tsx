// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · springs + instant feedback + materials (safe-mode: no new gesture code)
'use client';

import Image from 'next/image';

import { formatCurrency } from '@repo/shared/utils';
import { Button } from '@repo/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

import { QuantitySelector } from '@/app/[locale]/(shop)/_lib/components/common/QuantitySelector';
import type { CartLine } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';

export function CartTable() {
  const { items, updateQuantity, removeCartItemWithUndo } = useCart();

  return (
    <div className="space-y-3">
      <div className="text-muted-foreground hidden grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b px-1 pb-3 text-xs font-semibold tracking-wider uppercase sm:grid">
        <span>Sản phẩm</span>
        <span className="text-center">Đơn giá</span>
        <span className="text-center">Số lượng</span>
        <span className="text-right">Tổng</span>
      </div>

      <AnimatePresence initial={false}>
        {items.map((item) => (
          <CartRow
            key={item.skuId}
            item={item}
            onUpdateQty={(qty: number) => {
              updateQuantity(item.skuId, qty);
            }}
            onRemove={() => {
              removeCartItemWithUndo(item.skuId);
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface CartRowProps {
  readonly item: CartLine;
  readonly onUpdateQty: (qty: number) => void;
  readonly onRemove: () => void;
}

function CartRow({ item, onUpdateQty, onRemove }: CartRowProps) {
  const variantLabel = [item.color, item.size].filter((v): v is string => v !== null).join(' / ');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="bg-card hover:border-foreground/15 rounded-xl border p-4 shadow-sm transition-colors sm:p-5"
    >
      <div className="flex gap-4">
        <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-lg sm:size-24">
          <Image src={item.image ?? '/placeholder-product.png'} alt={item.name} fill sizes="96px" className="object-cover" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-1 font-semibold break-words">{item.name}</p>
              {variantLabel !== '' && <p className="text-muted-foreground mt-0.5 text-xs">{variantLabel}</p>}
              <p className="text-brand-600 mt-1 text-sm font-bold sm:hidden">{formatCurrency(item.price)}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label="Xóa sản phẩm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/40 shrink-0 focus-visible:ring-2"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <QuantitySelector value={item.quantity} min={1} max={item.stock} onChange={onUpdateQty} />

            <div className="text-right">
              <p className="text-muted-foreground hidden text-xs sm:block">
                {formatCurrency(item.price)} × {item.quantity}
              </p>
              <p className="text-brand-600 font-bold">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
