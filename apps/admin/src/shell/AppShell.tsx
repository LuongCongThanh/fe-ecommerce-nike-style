import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@repo/ui/sidebar';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useStaffAuth } from '@/core/session';
import { HeaderStubIcons } from '@/shell/HeaderStubIcons';
import { LanguageSwitcher } from '@/shell/LanguageSwitcher';
import { NAV_ITEMS } from '@/shell/nav-items';
import { NavCommandMenu } from '@/shell/NavCommandMenu';
import { ThemeToggle } from '@/shell/ThemeToggle';
import { UserMenu } from '@/shell/UserMenu';

/** Shadcn-admin's Sidebar primitive replaces the old hand-rolled `<aside>`/collapse-state shell —
 * same nav data (`NAV_ITEMS`), permission filtering, i18n and mobile-vs-desktop behavior, now built
 * on `SidebarProvider`'s cookie-persisted open state + `useIsMobile` instead of local `useState`. */
function NavMenu({ pathname, onNavigate }: { readonly pathname: string; readonly onNavigate?: () => void }): React.JSX.Element {
  const { t } = useTranslation('common');
  const { hasPermission } = useStaffAuth();
  const visibleItems = NAV_ITEMS.filter((item) => item.permission === undefined || hasPermission(item.permission));

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('nav.groupLabel')}</SidebarGroupLabel>
      <SidebarMenu>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={t(`nav.${item.labelKey}`)}>
                <Link to={item.href} onClick={onNavigate} aria-current={isActive ? 'page' : undefined}>
                  <item.icon />
                  <span>{t(`nav.${item.labelKey}`)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AppShell({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation('common');
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 justify-center px-3">
          <span className="text-brand-500 flex items-center gap-1 px-2 text-base font-black tracking-tight group-data-[collapsible=icon]:justify-center">
            <span className="group-data-[collapsible=icon]:hidden">
              ANTIGRAVITY<span className="text-muted-foreground">.ADMIN</span>
            </span>
            <span className="hidden group-data-[collapsible=icon]:inline">A</span>
          </span>
        </SidebarHeader>
        <SidebarContent>
          <NavMenu pathname={pathname} />
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="bg-background sticky top-0 z-(--z-index-sticky) flex h-16 items-center gap-3 border-b px-4">
          <SidebarTrigger />

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

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
