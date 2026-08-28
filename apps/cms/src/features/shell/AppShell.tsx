import { Button } from '@repo/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@repo/ui/sheet';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { useState } from 'react';

import { NAV_ITEMS } from '@/features/shell/nav-items';

function NavList({ pathname, onNavigate }: { readonly pathname: string; readonly onNavigate?: () => void }): React.JSX.Element {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            }`}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <aside className="bg-card hidden w-60 shrink-0 border-r md:flex md:flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-base font-black tracking-tight">
            ANTIGRAVITY<span className="text-muted-foreground">.CMS</span>
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavList pathname={pathname} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/95 sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-sm">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Mở menu điều hướng">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="border-b p-4 text-left">
                <SheetTitle className="text-base font-black tracking-tight">
                  ANTIGRAVITY<span className="text-muted-foreground">.CMS</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-3">
                <NavList
                  pathname={pathname}
                  onNavigate={() => {
                    setMobileOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          <span className="text-sm font-semibold">Nội dung</span>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
