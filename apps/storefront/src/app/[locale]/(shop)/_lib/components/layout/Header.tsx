'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@repo/ui/button';
import { Flame, Heart, LogOut, Search, ShoppingCart, User, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { CartDrawer } from '@/app/[locale]/(shop)/_lib/components/cart/CartDrawer';
import { DesktopMegaMenu } from '@/app/[locale]/(shop)/_lib/components/navigation/DesktopMegaMenu';
import { MobileNav } from '@/app/[locale]/(shop)/_lib/components/navigation/MobileNav';
import { mergeCartOnLogin, useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { mergeWishlistOnLogin, useWishlist } from '@/app/[locale]/(shop)/_lib/hooks/useWishlist';
import { useAuth } from '@/core/session/useAuth';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isLoggedIn, logout, authStatus } = useAuth();

  // Merge cart + wishlist sau đăng nhập (Decision #36, glossary.md — Merge Wishlist) — chạy đúng 1 lần
  // khi status chuyển sang authenticated (đăng nhập/đăng ký thành công), không chạy lại mỗi lần Header
  // re-render trong lúc đã đăng nhập.
  const wasAuthenticated = useRef(false);
  useEffect(() => {
    if (!wasAuthenticated.current && authStatus === 'authenticated') {
      mergeCartOnLogin().catch(() => undefined);
      mergeWishlistOnLogin().catch(() => undefined);
    }
    wasAuthenticated.current = authStatus === 'authenticated';
  }, [authStatus]);

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="bg-background/95 sticky top-0 z-(--z-index-sticky) w-full border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link href={`/${locale}/home`} className="group flex items-center gap-2">
            <span className="font-display text-xl font-black tracking-tighter">
              ANTIGRAVITY<span className="text-muted-foreground hidden sm:inline">.STORE</span>
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
                aria-label={t('search')}
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

          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon" aria-label="Tài khoản" asChild>
                <Link href={`/${locale}/account/profile`} aria-label="Tài khoản">
                  <User className="size-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Đăng xuất" onClick={logout}>
                <LogOut className="size-5" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" aria-label="Đăng nhập" asChild>
              <Link href={`/${locale}/login`} aria-label="Đăng nhập">
                <User className="size-5" />
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" aria-label="Yêu thích" className="relative" asChild>
            <Link href={`/${locale}/wishlist`} aria-label="Yêu thích">
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-xs font-bold">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>
          </Button>

          <CartDrawer>
            <Button variant="ghost" size="icon" aria-label="Giỏ hàng" className="relative">
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-xs font-bold">
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
