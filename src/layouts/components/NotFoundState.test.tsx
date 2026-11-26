import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NotFoundState } from '@/layouts/components/NotFoundState';

describe('NotFoundState', () => {
  it('shows the 404 message and a link back to the vi home page', () => {
    render(<NotFoundState />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/vi');
  });
});
