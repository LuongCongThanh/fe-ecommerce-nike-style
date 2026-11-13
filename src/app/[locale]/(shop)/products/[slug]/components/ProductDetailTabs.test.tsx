import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ProductDetailTabs } from '@/app/[locale]/(shop)/products/[slug]/components/ProductDetailTabs';

const baseProps = {
  description: 'Áo thun cotton thoáng mát.',
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
});
