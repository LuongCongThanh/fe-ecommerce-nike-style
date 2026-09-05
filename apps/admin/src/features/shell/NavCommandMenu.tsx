'use client';

import { useEffect, useState } from 'react';

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@repo/ui/command';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { useStaffAuth } from '@/core/session';
import { NAV_ITEMS } from '@/features/shell/nav-items';

/**
 * Cmd/Ctrl+K quick-nav palette — jumps to a page from `NAV_ITEMS`, the same permission-filtered list
 * `AppShell`'s sidebar renders. Not a general search (no indexable content — products/orders/staff
 * search is a separate, real feature to build later), so it doesn't claim to be one.
 */
export function NavCommandMenu(): React.JSX.Element {
  const t = useTranslations('common');
  const router = useRouter();
  const { hasPermission } = useStaffAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const visibleItems = NAV_ITEMS.filter((item) => item.permission === undefined || hasPermission(item.permission));

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
        className="flex h-10 w-full max-w-70 items-center gap-2 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-400 hover:bg-gray-50 sm:flex dark:border-gray-800 dark:hover:bg-white/5"
      >
        <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M17.5 17.5L13.875 13.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="flex-1 text-left">{t('search.placeholder')}</span>
        <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-400 dark:border-gray-700">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title={t('search.placeholder')} description={t('search.placeholder')}>
        <CommandInput placeholder={t('search.placeholder')} />
        <CommandList>
          <CommandEmpty>{t('search.empty')}</CommandEmpty>
          <CommandGroup heading={t('nav.groupLabel')}>
            {visibleItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
              >
                <item.icon className="size-4" />
                {t(`nav.${item.labelKey}`)}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
