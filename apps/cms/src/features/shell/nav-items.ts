import type { Permission } from '@repo/schemas/staff';
import { FileText, FolderTree, Image, LayoutDashboard, Newspaper } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
  /** Hidden unless the signed-in Staff has this permission — `undefined` means always visible once
   * logged in (issue #24, mirrors Admin's nav-items.ts from #18). ADMIN_STAFF has no `content:*`
   * permission, so none of the CMS business items below show up for them. */
  readonly permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/posts', label: 'Bài viết', icon: Newspaper, permission: 'content:read' },
  { href: '/pages', label: 'Trang', icon: FileText, permission: 'content:read' },
  { href: '/taxonomy', label: 'Danh mục nội dung', icon: FolderTree, permission: 'content:read' },
  { href: '/media', label: 'Media', icon: Image, permission: 'content:read' },
];
