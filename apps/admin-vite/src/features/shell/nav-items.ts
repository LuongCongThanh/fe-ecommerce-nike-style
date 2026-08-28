import type { Permission } from '@repo/schemas/staff';
import { Boxes, LayoutDashboard, Package, ShoppingBag, Tags, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  readonly href: string;
  /** Key into common.json's `nav` namespace, e.g. `t(\`nav.${labelKey}\`)`. */
  readonly labelKey: string;
  readonly icon: LucideIcon;
  /** Hidden unless the signed-in Staff has this permission — `undefined` means always visible once logged in (issue #18). */
  readonly permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/products', labelKey: 'products', icon: Package, permission: 'catalog:read' },
  { href: '/orders', labelKey: 'orders', icon: ShoppingBag, permission: 'order:read' },
  { href: '/categories', labelKey: 'categories', icon: Tags, permission: 'category:read' },
  { href: '/inventory', labelKey: 'inventory', icon: Boxes, permission: 'inventory:read' },
  { href: '/staff', labelKey: 'staff', icon: Users, permission: 'staff:read' },
  { href: '/customers', labelKey: 'customers', icon: Users },
];
