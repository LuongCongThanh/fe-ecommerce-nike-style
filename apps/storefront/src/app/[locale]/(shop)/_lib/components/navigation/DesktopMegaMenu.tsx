'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';

import type { NavCategory } from '@/app/[locale]/(shop)/_lib/data/nav-categories';
import { NAV_CATEGORIES } from '@/app/[locale]/(shop)/_lib/data/nav-categories';

interface DesktopMegaMenuProps {
  readonly locale: string;
}

export function DesktopMegaMenu({ locale }: DesktopMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NavCategory>(NAV_CATEGORIES[0]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const closeMenu = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // slight delay to prevent accidental closing
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (navRef.current?.contains(event.relatedTarget) !== true) {
      closeMenu();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <nav
      ref={navRef}
      className="relative"
      aria-label="Danh mục sản phẩm"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
      onFocus={openMenu}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      >
        Danh mục
        <ChevronDown className={`size-3.5 transition-transform duration-300 ease-out ${isOpen ? 'text-foreground rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-popover absolute top-full -left-16 z-(--z-dropdown) mt-2 w-150 overflow-hidden rounded-xl border shadow-md"
          >
            <div className="flex h-90">
              {/* Left Column: Categories */}
              <div className="bg-muted/50 w-50 shrink-0 border-r py-3">
                <ul className="relative flex flex-col px-2">
                  {NAV_CATEGORIES.map((cat) => {
                    const isActive = activeCategory.slug === cat.slug;
                    return (
                      <li key={cat.slug} className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => {
                            setActiveCategory(cat);
                          }}
                          onFocus={() => {
                            setActiveCategory(cat);
                          }}
                          className={`relative z-10 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <cat.icon className="size-4" />
                            {cat.name}
                          </span>
                          <ChevronRight className={`size-3.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                        {isActive ? (
                          <motion.div
                            layoutId="mega-menu-active-bg"
                            className="bg-muted absolute inset-0 z-0 rounded-lg"
                            initial={false}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Right Column: Sub-categories */}
              <div className="relative flex-1 overflow-hidden p-6">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={activeCategory.slug}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-full flex-col"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
                        <activeCategory.icon className="size-4.5" />
                        {activeCategory.name}
                      </h3>
                      <Link
                        href={`/${locale}/categories/${activeCategory.slug}`}
                        onClick={() => {
                          setIsOpen(false);
                        }}
                        className="group text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold tracking-wide transition-colors"
                      >
                        <span>Xem tất cả</span>
                        <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px]">{activeCategory.productCount}</span>
                      </Link>
                    </div>

                    <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {activeCategory.sub.map((sub, i) => (
                        <motion.li
                          key={sub.slug}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 + 0.1, duration: 0.2 }}
                        >
                          <Link
                            href={`/${locale}/categories/${sub.slug}`}
                            onClick={() => {
                              setIsOpen(false);
                            }}
                            className="hover:bg-muted group flex items-center rounded-lg p-2 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="text-muted-foreground group-hover:text-foreground text-sm font-medium transition-colors">
                                {sub.name}
                              </span>
                            </div>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Promotional Banner for specific categories */}
                    {activeCategory.slug === 'sale' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="bg-brand-50 relative mt-auto overflow-hidden rounded-xl p-4"
                      >
                        <div className="relative z-10">
                          <p className="text-brand-700 text-sm font-bold tracking-wider uppercase">Flash Sale</p>
                          <p className="text-brand-700 mt-1 text-lg leading-tight font-black">Giảm đến 70%</p>
                          <Link
                            href={`/${locale}/categories/sale/flash-sale`}
                            onClick={() => {
                              setIsOpen(false);
                            }}
                            className="bg-brand-600 hover:bg-brand-500 mt-3 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                          >
                            Mua ngay <ChevronRight className="size-3" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
