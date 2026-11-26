import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OfflineState } from '@/layouts/components/OfflineState';

describe('OfflineState', () => {
  it('tells the visitor they are offline and links to home and retry', () => {
    render(<OfflineState />);

    expect(screen.getByRole('heading', { name: 'Bạn đang ngoại tuyến' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/vi');
    expect(screen.getByRole('link', { name: 'Thử lại' })).toHaveAttribute('href', '/');
  });
});
