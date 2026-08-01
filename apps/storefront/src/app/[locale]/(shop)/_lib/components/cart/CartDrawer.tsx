'use client';

import Image from 'next/image';
import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useLocale } from 'next-intl';

import { QuantitySelector } from '@/app/[locale]/(shop)/_lib/components/common/QuantitySelector';
import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { Button } from '@/shared/components/base/button';
import { ScrollArea } from '@/shared/components/base/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/base/sheet';
import { formatCurrency } from '@/shared/lib/utils';

interface CartDrawerProps {
  readonly children: React.ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
  const locale = useLocale();
  const { items, updateQuantity, removeCartItem, total, itemCount } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent aria-describedby={undefined} className="bg-background flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b p-6">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag className="size-5" />
            Giỏ hàng của bạn
            <span className="bg-muted text-foreground ml-2 rounded-full px-2 py-0.5 text-xs font-medium">{itemCount}</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
                  <ShoppingBag className="text-muted-foreground size-8" />
                </div>
                <h3 className="text-lg font-medium">Giỏ hàng trống</h3>
                <p className="text-muted-foreground mt-1 text-sm">Hãy bắt đầu mua sắm để lấp đầy giỏ hàng của bạn!</p>
                <SheetTrigger asChild>
                  <Button variant="outline" className="mt-6">
                    Tiếp tục mua sắm
                  </Button>
                </SheetTrigger>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative flex gap-4"
                    >
                      <div className="bg-muted relative size-20 overflow-hidden rounded-lg">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h4 className="line-clamp-1 text-sm font-semibold">{item.name}</h4>
                          <p className="text-brand-600 mt-1 text-sm font-bold">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <QuantitySelector
                            value={item.quantity}
                            min={1}
                            onChange={(quantity) => {
                              updateQuantity(item.variantId, quantity);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Xóa sản phẩm"
                            onClick={() => {
                              removeCartItem(item.variantId);
                            }}
                            className="hover:text-destructive text-muted-foreground"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </ScrollArea>

        {items.length > 0 && (
          <div className="border-t p-6">
            <div className="mb-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span className="text-brand-600">{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SheetTrigger asChild>
                <Link href={`/${locale}/cart`}>
                  <Button variant="outline" className="w-full">
                    Xem giỏ hàng
                  </Button>
                </Link>
              </SheetTrigger>
              <Link href={`/${locale}/checkout`}>
                <Button className="w-full">Thanh toán</Button>
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
