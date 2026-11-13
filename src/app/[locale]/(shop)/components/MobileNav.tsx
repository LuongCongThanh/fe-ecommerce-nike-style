'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Menu } from 'lucide-react';

import { useCategoryTree } from '@/features/catalog/queries/useCategoryTree';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/Accordion';
import { Button } from '@/shared/ui/Button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/Sheet';

interface MobileNavProps {
  readonly locale: string;
}

export function MobileNav({ locale }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { data } = useCategoryTree();

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
            {(data?.tree ?? []).map((cat) => (
              <AccordionItem value={cat.id} key={cat.id} className="border-b">
                <AccordionTrigger className="px-2 py-3 text-sm font-medium hover:no-underline">
                  <span className="text-foreground">{cat.name}</span>
                </AccordionTrigger>
                <AccordionContent className="pr-2 pb-3 pl-4">
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/${locale}/categories/${cat.slug}`}
                      onClick={() => {
                        setOpen(false);
                      }}
                      className="text-muted-foreground hover:text-foreground mb-2 py-1 text-xs font-bold transition-colors"
                    >
                      Tất cả {cat.name}
                    </Link>
                    {cat.children.map((sub) => (
                      <Link
                        key={sub.id}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
