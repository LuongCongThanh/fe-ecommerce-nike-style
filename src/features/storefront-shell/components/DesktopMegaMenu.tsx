'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { useCategoryTree } from '@/features/catalog/queries/useCategoryTree';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover';

// Apple Design pass · springs + instant feedback + materials (safe-mode: no new gesture code)

interface DesktopMegaMenuProps {
  readonly locale: string;
}

export function DesktopMegaMenu({ locale }: DesktopMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useCategoryTree();
  const roots = data?.tree ?? [];
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const activeCategory = roots.find((c) => c.id === activeId) ?? roots[0];
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  if (activeCategory === undefined) return null;

  return (
    // openMenu/closeMenu also drive focus/blur (not just hover): PopoverContent renders through a
    // portal, but React dispatches focus/blur/mouse events along the *component* tree, so they still
    // bubble up to this <nav> even though the content isn't a DOM descendant of it. That lets a single
    // pair of handlers cover both mouse hover-intent and keyboard tab-through without a manual
    // navRef.contains() check (which would break against portaled content).
    <nav aria-label="Product categories" onMouseEnter={openMenu} onMouseLeave={closeMenu} onFocus={openMenu} onBlur={closeMenu}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground active:scale-0.97 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-[color,transform] active:duration-100"
          >
            Danh mục
            <ChevronDown className={`size-3.5 transition-transform duration-300 ease-out ${isOpen ? 'text-foreground rotate-180' : ''}`} />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={24}
          onOpenAutoFocus={(event) => {
            event.preventDefault(); // a hover-opened menu shouldn't steal focus from the trigger
          }}
          className="w-150 overflow-hidden rounded-2xl border p-0 shadow-md"
        >
          <div className="flex h-90">
            {/* Left Column: Categories */}
            <div className="bg-muted/50 w-50 shrink-0 border-r py-3">
              <ul className="relative flex flex-col px-2">
                {roots.map((cat) => {
                  const isActive = activeCategory.id === cat.id;
                  return (
                    <li key={cat.slug} className="relative">
                      <button
                        type="button"
                        onMouseEnter={() => {
                          setActiveId(cat.id);
                        }}
                        onFocus={() => {
                          setActiveId(cat.id);
                        }}
                        className={`active:scale-0.97 relative z-10 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-[color,transform] active:duration-100 ${
                          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">{cat.name}</span>
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
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="flex h-full flex-col"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">{activeCategory.name}</h3>
                    <Link
                      href={`/${locale}/categories/${activeCategory.slug}`}
                      onClick={() => {
                        setIsOpen(false);
                      }}
                      className="group text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold tracking-wide transition-colors"
                    >
                      <span>Xem tất cả</span>
                    </Link>
                  </div>

                  <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {activeCategory.children.map((sub, i) => (
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
                          className="hover:bg-muted group active:scale-0.97 flex items-center rounded-lg p-2 transition-[color,background-color,transform] active:duration-100"
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </nav>
  );
}
