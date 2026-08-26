import type { Permission } from '@repo/schemas/staff';
import { Boxes, LayoutDashboard, Package, ShoppingBag, Tags, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
  /** Hidden unless the signed-in Staff has this permission — `undefined` means always visible once logged in (issue #18). */
  readonly permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/products', label: 'Sản phẩm', icon: Package, permission: 'catalog:read' },
  { href: '/orders', label: 'Đơn hàng', icon: ShoppingBag, permission: 'order:read' },
  { href: '/categories', label: 'Danh mục', icon: Tags, permission: 'category:read' },
  { href: '/inventory', label: 'Tồn kho', icon: Boxes, permission: 'inventory:read' },
  { href: '/staff', label: 'Nhân viên', icon: Users, permission: 'staff:read' },
  { href: '/customers', label: 'Khách hàng', icon: Users },
];
