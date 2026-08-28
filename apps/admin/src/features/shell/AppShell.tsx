import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@repo/ui/sheet';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStaffAuth } from '@/core/session';
import { HeaderStubIcons } from '@/features/shell/HeaderStubIcons';
import { LanguageSwitcher } from '@/features/shell/LanguageSwitcher';
import { NAV_ITEMS } from '@/features/shell/nav-items';
import { NavCommandMenu } from '@/features/shell/NavCommandMenu';
import { ThemeToggle } from '@/features/shell/ThemeToggle';
import { UserMenu } from '@/features/shell/UserMenu';

/** TailAdmin-style nav list: uppercase "MENU" group label + `menu-item`/`menu-item-active` utility
 * classes (globals.css) ported from TailAdmin's `src/css/style.css`. `collapsed` hides the text
 * label and centers the icon, matching the desktop sidebar's collapsed (icon-rail) state. */
function NavList({
  pathname,
  collapsed = false,
  onNavigate,
}: {
  readonly pathname: string;
  readonly collapsed?: boolean;
  readonly onNavigate?: () => void;
}): React.JSX.Element {
  const { t } = useTranslation('common');
  const { hasPermission } = useStaffAuth();
  const visibleItems = NAV_ITEMS.filter((item) => item.permission === undefined || hasPermission(item.permission));

  return (
    <nav>
      <h3 className="text-theme-xs mb-4 px-3 text-gray-400 uppercase">{collapsed ? '···' : t('nav.groupLabel')}</h3>
      <ul className="flex flex-col gap-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? t(`nav.${item.labelKey}`) : undefined}
                className={`menu-item group ${isActive ? 'menu-item-active' : 'menu-item-inactive'} ${collapsed ? 'justify-center' : ''}`}
              >
                <item.icon className={`size-5 shrink-0 ${isActive ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}`} />
                {collapsed ? null : t(`nav.${item.labelKey}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation('common');
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <aside
        className={`bg-card sticky top-0 hidden h-screen shrink-0 border-r border-gray-200 transition-[width] duration-200 md:flex md:flex-col dark:border-gray-800 ${
          collapsed ? 'md:w-22.5' : 'md:w-72.5'
        }`}
      >
        <div className={`flex h-16 items-center border-b border-gray-200 px-5 dark:border-gray-800 ${collapsed ? 'justify-center' : ''}`}>
          <span className="text-brand-500 text-base font-black tracking-tight">
            {collapsed ? (
              'A'
            ) : (
              <>
                ANTIGRAVITY<span className="text-gray-400">.ADMIN</span>
              </>
            )}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <NavList pathname={pathname} collapsed={collapsed} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-card sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              setCollapsed((c) => !c);
            }}
            className="hidden size-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 md:flex dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label={collapsed ? t('expandSidebar') : t('collapseSidebar')}
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 md:hidden dark:border-gray-800 dark:text-gray-400"
                aria-label={t('openNavMenu')}
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="border-b border-gray-200 p-4 text-left dark:border-gray-800">
                <SheetTitle className="text-brand-500 text-base font-black tracking-tight">
                  ANTIGRAVITY<span className="text-gray-400">.ADMIN</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-3 py-6">
                <NavList
                  pathname={pathname}
                  onNavigate={() => {
                    setMobileOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          <span className="hidden text-sm font-semibold md:inline">{t('adminLabel')}</span>

          <div className="hidden flex-1 justify-center sm:flex">
            <NavCommandMenu />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <LanguageSwitcher />
            <HeaderStubIcons />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="min-w-0 flex-1 bg-gray-50 p-4 md:p-6 dark:bg-gray-900">{children}</main>
      </div>
    </div>
  );
}
