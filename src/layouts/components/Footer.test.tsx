import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from '@/layouts/components/Footer';

describe('Footer', () => {
  it('renders the brand statement and the footer navigation links', () => {
    render(<Footer />);

    expect(screen.getByRole('navigation', { name: 'Liên kết footer' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tất cả sản phẩm' })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Đơn hàng của tôi' })).toHaveAttribute('href', '/account/orders');
  });

  it('shows support contact info and the current year', () => {
    render(<Footer />);

    expect(screen.getByText('support@antigravity.store')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
  });
});
