import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ProductDetailTabs } from '@/app/[locale]/(shop)/_lib/components/products/ProductDetailTabs';

const baseProps = {
  description: 'Áo thun cotton thoáng mát.',
  rating: 4.5,
  reviewCount: 10,
};

describe('ProductDetailTabs', () => {
  it('shows the product description by default', () => {
    render(<ProductDetailTabs {...baseProps} />);
    expect(screen.getByText('Áo thun cotton thoáng mát.')).toBeInTheDocument();
  });

  it('reveals specs after activating the specs section', async () => {
    const user = userEvent.setup();
    render(<ProductDetailTabs {...baseProps} />);
    await user.click(screen.getByText('Thông số'));
    expect(screen.getByText('Việt Nam')).toBeInTheDocument();
  });

  it('reveals reviews after activating the reviews section', async () => {
    const user = userEvent.setup();
    render(<ProductDetailTabs {...baseProps} />);
    await user.click(screen.getByText(/Đánh giá/));
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
  });

  it('shows the review count in the reviews section trigger', () => {
    render(<ProductDetailTabs {...baseProps} />);
    expect(screen.getByText(/Đánh giá \(10\)/)).toBeInTheDocument();
  });
});
