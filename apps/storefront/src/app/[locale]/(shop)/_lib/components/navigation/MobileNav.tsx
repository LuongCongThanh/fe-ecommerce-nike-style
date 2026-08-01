'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Flame, Menu } from 'lucide-react';

import { NAV_CATEGORIES } from '@/app/[locale]/(shop)/_lib/data/nav-categories';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/base/accordion';
import { Button } from '@/shared/components/base/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/base/sheet';

interface MobileNavProps {
  readonly locale: string;
}

export function MobileNav({ locale }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0 sm:max-w-xs">
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle className="text-xl font-black tracking-tighter">
            ANTIGRAVITY<span className="text-muted-foreground">.STORE</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="mb-4">
            <Link
              href={`/${locale}/products`}
              onClick={() => {
                setOpen(false);
              }}
              className="text-foreground hover:text-muted-foreground block rounded-lg px-2 py-3 text-sm font-semibold transition-colors"
            >
              Tất cả sản phẩm
            </Link>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {NAV_CATEGORIES.map((cat) => (
              <AccordionItem value={cat.slug} key={cat.slug} className="border-b">
                <AccordionTrigger className="px-2 py-3 text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-3">
                    <cat.icon className="size-5" />
                    <span className="text-foreground">{cat.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pr-2 pb-3 pl-11">
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/${locale}/categories/${cat.slug}`}
                      onClick={() => {
                        setOpen(false);
                      }}
                      className="text-muted-foreground hover:text-foreground mb-2 py-1 text-xs font-bold transition-colors"
                    >
                      TẤT CẢ {cat.name.toUpperCase()} ({cat.productCount})
                    </Link>
                    {cat.sub.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/${locale}/categories/${sub.slug}`}
                        onClick={() => {
                          setOpen(false);
                        }}
                        className="text-muted-foreground hover:text-foreground block rounded-md py-2 text-sm transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-6 border-t pt-4">
            <Link
              href={`/${locale}/categories/sale`}
              onClick={() => {
                setOpen(false);
              }}
              className="text-brand-600 hover:bg-brand-50 flex items-center gap-3 rounded-lg px-2 py-3 text-sm font-bold transition-colors"
            >
              <Flame className="size-5" />
              Flash Sale
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
