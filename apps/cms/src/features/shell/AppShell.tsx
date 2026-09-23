import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@repo/ui/sidebar';
import { AppShellLayout } from '@repo/ui/app-shell-layout';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { NAV_ITEMS } from '@/features/shell/nav-items';

/** Shadcn-admin's Sidebar primitive replaces the old hand-rolled `<aside>`/Sheet shell — same
 * `NAV_ITEMS`, now with cookie-persisted collapse state and an icon-rail collapsed mode for free. */
function NavMenu({ pathname, onNavigate }: { readonly pathname: string; readonly onNavigate?: () => void }): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('nav.groupLabel')}</SidebarGroupLabel>
      <SidebarMenu>
        {NAV_ITEMS.map((item) => {
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
    <AppShellLayout
      sidebarHeaderClassName="h-14"
      headerClassName="bg-background/95 h-14 backdrop-blur-sm"
      brand={
        <span className="flex items-center gap-1 px-2 text-base font-black tracking-tight group-data-[collapsible=icon]:justify-center">
          <span className="group-data-[collapsible=icon]:hidden">
            ANTIGRAVITY<span className="text-muted-foreground">.CMS</span>
          </span>
          <span className="hidden group-data-[collapsible=icon]:inline">A</span>
        </span>
      }
      nav={<NavMenu pathname={pathname} />}
      headerContent={<span className="text-sm font-semibold">{t('cmsLabel')}</span>}
    >
      {children}
    </AppShellLayout>
  );
}
