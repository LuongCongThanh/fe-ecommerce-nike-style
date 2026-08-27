import type { Permission, StaffRole } from '@repo/schemas/staff';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import commonMessages from '@/lang/vi/common.json';

import { clearStaffAuth, setStaffSession } from '@/core/session';
import { AppShell } from '@/features/shell/AppShell';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  // `@/core/session` wires `useRouter` in at import time (issue #24's shared staff-auth module), so
  // even tests that never trigger a redirect need this mocked or the module import itself throws.
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a href={typeof href === 'string' ? href : '#'} {...props}>
      {children}
    </a>
  ),
}));

function renderAppShell(children: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="vi" messages={{ common: commonMessages }}>
      <AppShell>{children}</AppShell>
    </NextIntlClientProvider>,
  );
}

function staffWithRoles(roles: StaffRole[], permissions: Permission[]) {
  setStaffSession({
    staff: { id: 1, email: 'staff@admin.local', name: 'Staff', roles, isActive: true },
    permissions,
  });
}

afterEach(() => {
  clearStaffAuth();
});

describe('AppShell — menu visibility by permission (issue #18)', () => {
  beforeEach(() => {
    clearStaffAuth();
  });

  it('ADMIN_STAFF sees Products/Orders/Categories', () => {
    staffWithRoles(['ADMIN_STAFF'], ['catalog:read', 'order:read', 'category:read']);
    renderAppShell(<p>content</p>);

    expect(screen.getByRole('link', { name: /Sản phẩm/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đơn hàng/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Danh mục/ })).toBeInTheDocument();
  });

  it('CMS_EDITOR does not see the Admin business menu (catalog/order/category)', () => {
    staffWithRoles(['CMS_EDITOR'], ['content:read']);
    renderAppShell(<p>content</p>);

    expect(screen.queryByRole('link', { name: /Sản phẩm/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Đơn hàng/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Danh mục/ })).not.toBeInTheDocument();
  });

  it('SUPER_ADMIN sees every menu item', () => {
    staffWithRoles(['SUPER_ADMIN'], ['catalog:read', 'order:read', 'category:read']);
    renderAppShell(<p>content</p>);

    expect(screen.getByRole('link', { name: /Sản phẩm/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đơn hàng/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Danh mục/ })).toBeInTheDocument();
  });
});
