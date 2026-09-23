import type { Permission } from '@repo/schemas/staff';
import { Blocks, Boxes, LayoutDashboard, ListTodo, MessagesSquare, Package, Settings, ShoppingBag, Tags, UserCircle, Users } from 'lucide-react';
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
  // No `permission` — every signed-in staff member can use these (all local-only demo features).
  { href: '/customers', labelKey: 'customers', icon: UserCircle },
  { href: '/tasks', labelKey: 'tasks', icon: ListTodo },
  { href: '/chats', labelKey: 'chats', icon: MessagesSquare },
  { href: '/apps', labelKey: 'apps', icon: Blocks },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];
