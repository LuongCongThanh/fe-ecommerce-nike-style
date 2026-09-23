import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '../components/Sidebar';
import { cn } from '../lib/cn';

export interface AppShellLayoutProps {
  readonly brand: React.ReactNode;
  readonly nav: React.ReactNode;
  readonly headerContent?: React.ReactNode;
  readonly sidebarHeaderClassName?: string;
  readonly headerClassName?: string;
  readonly children: React.ReactNode;
}

/** Sidebar/header skeleton shared by Admin and CMS's app shells — brand, nav and header content stay
 * app-owned so each app keeps its own i18n/permission behavior instead of this primitive assuming one. */
export function AppShellLayout({
  brand,
  nav,
  headerContent,
  sidebarHeaderClassName,
  headerClassName,
  children,
}: AppShellLayoutProps): React.JSX.Element {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className={cn('h-16 justify-center px-3', sidebarHeaderClassName)}>{brand}</SidebarHeader>
        <SidebarContent>{nav}</SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className={cn('bg-background sticky top-0 z-(--z-index-sticky) flex h-16 items-center gap-3 border-b px-4', headerClassName)}>
          <SidebarTrigger />
          {headerContent}
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
