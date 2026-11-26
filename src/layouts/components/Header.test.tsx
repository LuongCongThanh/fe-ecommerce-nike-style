import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/features/auth/session/useAuth';
import { Header } from '@/layouts/components/Header';
import { getCategoryTree } from '@/lib/api/endpoints/catalog';
import { renderWithProviders } from '@/testing/render';

const push = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('next-intl', async (importOriginal) => ({ ...(await importOriginal<typeof import('next-intl')>()), useLocale: () => 'vi' }));
vi.mock('@/lib/api/endpoints/catalog', () => ({ getCategoryTree: vi.fn() }));
vi.mock('@/lib/api/endpoints/cart', () => ({ getSkusByIds: vi.fn().mockResolvedValue([]), mergeCartAfterLogin: vi.fn().mockResolvedValue([]) }));
vi.mock('@/lib/api/endpoints/wishlist', () => ({
  getProductsByIds: vi.fn().mockResolvedValue([]),
  mergeWishlistAfterLogin: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/lib/api/endpoints/auth', () => ({ logout: vi.fn().mockResolvedValue(undefined) }));

const customer = {
  id: 1,
  email: 'user@test.com',
  firstName: 'User',
  lastName: 'Test',
  avatar: null,
  role: 'customer' as const,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
};

function LoginProbe() {
  const { login, logout } = useAuth();
  return (
    <>
      <button type="button" onClick={() => login('token', customer)}>
        probe-login
      </button>
      <button type="button" onClick={logout}>
        probe-logout
      </button>
    </>
  );
}

beforeEach(() => {
  vi.mocked(getCategoryTree).mockResolvedValue([]);
});

describe('Header', () => {
  it('links guests to login and wishlist with the active locale', () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/vi/login');
    expect(screen.getByRole('link', { name: 'Yêu thích' })).toHaveAttribute('href', '/vi/wishlist');
    expect(screen.getByRole('button', { name: 'Giỏ hàng' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });

  it('replaces the login link with the account menu once the session is authenticated', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <Header />
        <LoginProbe />
      </>,
    );

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'probe-login' }));
    });

    expect(screen.queryByRole('link', { name: 'Đăng nhập' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tài khoản' })).toBeInTheDocument();
  });

  it('opens the inline search and navigates to the localized search route on submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }));
    await user.type(screen.getByRole('textbox', { name: 'Tìm kiếm' }), 'giày chạy{Enter}');

    expect(push).toHaveBeenCalledWith('/vi/search?q=gi%C3%A0y%20ch%E1%BA%A1y');
  });

  it('closes the inline search without navigating', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);

    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }));
    await user.click(screen.getByRole('button', { name: 'Đóng tìm kiếm' }));

    expect(screen.queryByRole('textbox', { name: 'Tìm kiếm' })).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
