import { FileText, FolderTree, Image, LayoutDashboard, Newspaper, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/posts', label: 'Bài viết', icon: Newspaper },
  { href: '/pages', label: 'Trang', icon: FileText },
  { href: '/taxonomy', label: 'Danh mục nội dung', icon: FolderTree },
  { href: '/media', label: 'Media', icon: Image },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];
