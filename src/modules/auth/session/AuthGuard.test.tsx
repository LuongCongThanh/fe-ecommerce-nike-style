import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthGuard } from '@/modules/auth/session/AuthGuard';
import { clearAuth, setAccessToken } from '@/modules/auth/stores/auth.store';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('next-intl', () => ({ useLocale: () => 'vi' }));

describe('AuthGuard', () => {
  beforeEach(() => {
    clearAuth();
    replace.mockClear();
  });

  it('renders nothing and redirects to login when there is no session', () => {
    render(<AuthGuard>secret</AuthGuard>);

    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('/vi/login');
  });

  it('renders children when a session token exists', () => {
    setAccessToken('token');
    render(<AuthGuard>secret</AuthGuard>);

    expect(screen.getByText('secret')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
