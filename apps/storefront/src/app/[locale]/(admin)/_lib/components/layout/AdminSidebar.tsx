'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Package, ShoppingBag } from 'lucide-react';
import { useLocale } from 'next-intl';

import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/utils';

const NAV_ITEMS = [
  { href: ROUTES.ADMIN.PRODUCTS, label: 'Sản phẩm', icon: Package },
  { href: ROUTES.ADMIN.ORDERS, label: 'Đơn hàng', icon: ShoppingBag },
] as const;

export function AdminSidebar(): React.JSX.Element {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r md:block">
      <div className="flex h-16 items-center px-6 font-black tracking-tight">ADMIN</div>
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const fullHref = `/${locale}${href}`;
          const isActive = pathname.startsWith(fullHref);

          return (
            <Link
              key={href}
              href={fullHref}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
