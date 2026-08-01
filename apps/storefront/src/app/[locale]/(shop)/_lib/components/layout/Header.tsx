'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Flame, Search, ShoppingCart, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { CartDrawer } from '@/app/[locale]/(shop)/_lib/components/cart/CartDrawer';
import { DesktopMegaMenu } from '@/app/[locale]/(shop)/_lib/components/navigation/DesktopMegaMenu';
import { MobileNav } from '@/app/[locale]/(shop)/_lib/components/navigation/MobileNav';
import { useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { Button } from '@/shared/components/base/button';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="bg-background/95 sticky top-0 z-(--z-header) w-full border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link href={`/${locale}/home`} className="group flex items-center gap-2">
            <span className="font-display text-xl font-black tracking-tighter">
              ANTIGRAVITY<span className="text-muted-foreground">.STORE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href={`/${locale}/products`}
              className="text-muted-foreground hover:text-foreground relative rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              Tất cả sản phẩm
            </Link>

            <DesktopMegaMenu locale={locale} />

            <Link
              href={`/${locale}/categories/sale`}
              className="text-brand-600 hover:text-brand-500 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors"
            >
              <Flame className="size-4" />
              Flash Sale
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder="Tìm kiếm sản phẩm..."
                className="bg-background focus-visible:ring-ring h-9 w-48 rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 sm:w-64"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('closeSearch')}
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
              >
                <X className="size-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('search')}
              onClick={() => {
                setSearchOpen(true);
              }}
              className="hidden sm:inline-flex"
            >
              <Search className="size-5" />
            </Button>
          )}

          <CartDrawer>
            <Button variant="ghost" size="icon" aria-label="Giỏ hàng" className="relative">
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <span className="bg-brand-600 absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Button>
          </CartDrawer>

          <MobileNav locale={locale} />
        </div>
      </div>
    </header>
  );
}
