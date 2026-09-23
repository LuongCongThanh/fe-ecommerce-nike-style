import { FileText, FolderTree, Image, LayoutDashboard, Newspaper, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  readonly href: string;
  readonly labelKey: string;
  readonly icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/posts', labelKey: 'posts', icon: Newspaper },
  { href: '/pages', labelKey: 'pages', icon: FileText },
  { href: '/taxonomy', labelKey: 'taxonomy', icon: FolderTree },
  { href: '/media', labelKey: 'media', icon: Image },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];
