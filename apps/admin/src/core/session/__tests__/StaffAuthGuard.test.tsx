import type { Staff } from '@repo/schemas/staff';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StaffAuthGuard } from '@/core/session/StaffAuthGuard';
import { clearStaffAuth, setStaffSession } from '@/core/session/staff-store';

const navigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
}));

const STAFF: Staff = { id: 1, email: 'super@admin.local', name: 'Super Admin', roles: ['SUPER_ADMIN'], isActive: true };

beforeEach(() => {
  navigate.mockClear();
  clearStaffAuth();
});

afterEach(() => {
  clearStaffAuth();
});

describe('StaffAuthGuard', () => {
  it('redirects to /login and does not render children when there is no session', async () => {
    render(
      <StaffAuthGuard>
        <p>Protected content</p>
      </StaffAuthGuard>,
    );

    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/login' }));
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children once a Staff session exists, without redirecting', () => {
    setStaffSession({ staff: STAFF, permissions: ['staff:read'] });

    render(
      <StaffAuthGuard>
        <p>Protected content</p>
      </StaffAuthGuard>,
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});
