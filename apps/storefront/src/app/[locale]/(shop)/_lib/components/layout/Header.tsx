'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { cn } from '@repo/shared/utils';
import { Button } from '@repo/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@repo/ui/dropdown-menu';
import { Input } from '@repo/ui/input';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Flame, Heart, LogOut, Search, ShoppingCart, User, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { CartDrawer } from '@/app/[locale]/(shop)/_lib/components/cart/CartDrawer';
import { DesktopMegaMenu } from '@/app/[locale]/(shop)/_lib/components/navigation/DesktopMegaMenu';
import { MobileNav } from '@/app/[locale]/(shop)/_lib/components/navigation/MobileNav';
import { mergeCartOnLogin, useCart } from '@/app/[locale]/(shop)/_lib/hooks/useCart';
import { mergeWishlistOnLogin, useWishlist } from '@/app/[locale]/(shop)/_lib/hooks/useWishlist';
import { useAuth } from '@/core/session/useAuth';

// Shared hover treatment for every icon-action button (search/account/wishlist/cart) — a small
// lift + shadow-depth increase on hover reads as tactile/dimensional. Appended to the existing
// transition-property list (color/background/border/box-shadow, from Button's own base classes)
// rather than replacing it, so the built-in hover-color transition keeps working — tailwind-merge
// dedupes same-group utilities and would otherwise drop the base one.
// Apple Design pass · springs + instant feedback + materials (safe-mode: no new gesture code)
const ICON_BUTTON_3D =
  'transition-[color,background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97] active:duration-100';

/** Small pointer-tilt badge next to the wordmark — the header's one deliberate 3D moment. Tilts
 * toward the cursor via framer-motion springs on rotateX/rotateY; stays flat when the user prefers
 * reduced motion. */
function LogoMark() {
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-14, 14]), springConfig);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion === true) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} style={{ perspective: 500 }} className="shrink-0">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="from-brand-500 to-brand-700 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black text-white shadow-md ring-1 ring-white/25 ring-inset"
        aria-hidden="true"
      >
        A
      </motion.div>
    </motion.div>
  );
}

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Tracks scroll position so the full-width sticky bar can dock flat + elevated (blur, shadow,
  // visible border) once the page scrolls past the top, instead of a static bar — reinforces
  // "always visible on top" with a felt depth change rather than a plain fixed strip.
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    // Full-width, edge-to-edge sticky bar (reversal of the earlier floating-inset-bar treatment —
    // requested explicitly). DesktopMegaMenu/MobileNav/CartDrawer don't depend on the header's
    // layout (mega menu positions off its own trigger; mobile nav/cart are portal-based sheets),
    // confirmed when that inset treatment was introduced, so going back to edge-to-edge is safe.
    <header
      className={cn(
        'sticky top-0 z-(--z-index-sticky) w-full border-b transition-[background-color,box-shadow,border-color] duration-(--duration-normal) ease-out',
        isScrolled ? 'bg-background/90 border-border shadow-lg backdrop-blur-md' : 'border-transparent bg-transparent shadow-none',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link href={`/${locale}/home`} className="group flex items-center gap-2.5">
            <LogoMark />
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
              All Products
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
              <Input
                autoFocus
                type="text"
                aria-label={t('search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder="Search products..."
                className="h-11 w-48 rounded-lg sm:w-64"
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
                className={ICON_BUTTON_3D}
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
              className={cn('hidden sm:inline-flex', ICON_BUTTON_3D)}
            >
              <Search className="size-5" />
            </Button>
          )}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account" className={ICON_BUTTON_3D}>
                  <User className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/account/profile`}>
                    <User /> Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={logout}>
                  <LogOut /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" aria-label="Login" asChild className={ICON_BUTTON_3D}>
              <Link href={`/${locale}/login`} aria-label="Login">
                <User className="size-5" />
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" aria-label="Wishlist" className={cn('relative', ICON_BUTTON_3D)} asChild>
            <Link href={`/${locale}/wishlist`} aria-label="Wishlist">
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-xs font-bold">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>
          </Button>

          <CartDrawer>
            <Button variant="ghost" size="icon" aria-label="Cart" className={cn('relative', ICON_BUTTON_3D)}>
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
