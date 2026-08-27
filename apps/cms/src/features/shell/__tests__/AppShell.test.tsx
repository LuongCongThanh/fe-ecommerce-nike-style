import type { Permission, StaffRole } from '@repo/schemas/staff';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearStaffAuth, setStaffSession } from '@/core/session';
import { AppShell } from '@/features/shell/AppShell';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  // `@/core/session` wires `useRouter` in at import time (issue #24's shared staff-auth module), so
  // even tests that never trigger a redirect need this mocked or the module import itself throws.
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a href={typeof href === 'string' ? href : '#'} {...props}>
      {children}
    </a>
  ),
}));

function staffWithRoles(roles: StaffRole[], permissions: Permission[]) {
  setStaffSession({
    staff: { id: 1, email: 'staff@cms.local', name: 'Staff', roles, isActive: true },
    permissions,
  });
}

afterEach(() => {
  clearStaffAuth();
});

describe('AppShell — menu visibility by permission (issue #24)', () => {
  beforeEach(() => {
    clearStaffAuth();
  });

  it('CMS_EDITOR sees the CMS business menu (posts/pages/taxonomy/media)', () => {
    staffWithRoles(['CMS_EDITOR'], ['content:read', 'content:write', 'content:publish', 'content:unpublish']);
    render(<AppShell>content</AppShell>);

    expect(screen.getByRole('link', { name: /Bài viết/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Trang/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Danh mục nội dung/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Media/ })).toBeInTheDocument();
  });

  it('ADMIN_STAFF — no content:* permission — does not see the CMS business menu', () => {
    staffWithRoles(['ADMIN_STAFF'], ['catalog:read', 'order:read', 'category:read', 'inventory:read']);
    render(<AppShell>content</AppShell>);

    expect(screen.queryByRole('link', { name: /Bài viết/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Trang/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Danh mục nội dung/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Media/ })).not.toBeInTheDocument();
    // Dashboard has no `permission` gate — always visible once logged in.
    expect(screen.getByRole('link', { name: /Tổng quan/ })).toBeInTheDocument();
  });

  it('SUPER_ADMIN sees every menu item', () => {
    staffWithRoles(['SUPER_ADMIN'], ['content:read', 'content:write', 'content:publish', 'content:unpublish']);
    render(<AppShell>content</AppShell>);

    expect(screen.getByRole('link', { name: /Bài viết/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Trang/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Danh mục nội dung/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Media/ })).toBeInTheDocument();
  });
});
