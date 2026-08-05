import { LayoutDashboard, Package, ShoppingBag, Tags, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/products', label: 'Sản phẩm', icon: Package },
  { href: '/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { href: '/categories', label: 'Danh mục', icon: Tags },
  { href: '/customers', label: 'Khách hàng', icon: Users },
];
