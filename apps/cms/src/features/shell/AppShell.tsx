import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
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

import { NAV_ITEMS } from '@/features/shell/nav-items';

/** Shadcn-admin's Sidebar primitive replaces the old hand-rolled `<aside>`/Sheet shell — same
 * `NAV_ITEMS`, now with cookie-persisted collapse state and an icon-rail collapsed mode for free. */
function NavMenu({ pathname, onNavigate }: { readonly pathname: string; readonly onNavigate?: () => void }): React.JSX.Element {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                <Link to={item.href} onClick={onNavigate} aria-current={isActive ? 'page' : undefined}>
                  <item.icon />
                  <span>{item.label}</span>
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-14 justify-center px-3">
          <span className="flex items-center gap-1 px-2 text-base font-black tracking-tight group-data-[collapsible=icon]:justify-center">
            <span className="group-data-[collapsible=icon]:hidden">
              ANTIGRAVITY<span className="text-muted-foreground">.CMS</span>
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
        <header className="bg-background/95 sticky top-0 z-(--z-index-sticky) flex h-14 items-center gap-3 border-b px-4 backdrop-blur-sm">
          <SidebarTrigger />
          <span className="text-sm font-semibold">Nội dung</span>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
