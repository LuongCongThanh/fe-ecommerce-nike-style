import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PriceDisplay } from '@/app/[locale]/(shop)/_lib/components/common/PriceDisplay';

describe('PriceDisplay', () => {
  it('shows only the main price span when no sale price', () => {
    const { container } = render(<PriceDisplay price={500000} />);
    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(1);
  });

  it('shows two price spans when salePrice < price', () => {
    const { container } = render(<PriceDisplay price={500000} salePrice={350000} />);
    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(2);
  });

  it('original price span has line-through class when there is a discount', () => {
    const { container } = render(<PriceDisplay price={500000} salePrice={350000} />);
    const originalSpan = container.querySelectorAll('span')[1];
    expect(originalSpan).toHaveClass('line-through');
  });

  it('main price span does not have line-through when no sale price', () => {
    const { container } = render(<PriceDisplay price={500000} />);
    expect(container.querySelector('span')).not.toHaveClass('line-through');
  });

  it('shows discount badge when showDiscountBadge=true and salePrice < price', () => {
    render(<PriceDisplay price={500000} salePrice={400000} showDiscountBadge />);
    expect(screen.getByText(/-\d+%/)).toBeInTheDocument();
  });

  it('hides discount badge when showDiscountBadge is false (default)', () => {
    render(<PriceDisplay price={500000} salePrice={400000} />);
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });

  it('does not show second price span when salePrice equals price', () => {
    const { container } = render(<PriceDisplay price={300000} salePrice={300000} />);
    expect(container.querySelectorAll('span')).toHaveLength(1);
  });

  it('does not show second price span when salePrice is null', () => {
    const { container } = render(<PriceDisplay price={300000} salePrice={null} />);
    expect(container.querySelectorAll('span')).toHaveLength(1);
  });

  it('does not show discount badge when salePrice equals price even with showDiscountBadge', () => {
    render(<PriceDisplay price={300000} salePrice={300000} showDiscountBadge />);
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });
});
