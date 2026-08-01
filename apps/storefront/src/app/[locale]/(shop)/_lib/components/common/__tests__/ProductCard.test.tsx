import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductCard } from '@/app/[locale]/(shop)/_lib/components/common/ProductCard';

const baseProps = {
  id: 1,
  name: 'Giày chạy bộ Revolution',
  slug: 'giay-chay-bo-revolution',
  price: 1500000,
  images: ['/img/product.jpg'],
  locale: 'vi',
};

describe('ProductCard', () => {
  it('renders the product name', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText('Giày chạy bộ Revolution')).toBeInTheDocument();
  });

  it('links to the product detail page by locale and slug', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/vi/products/giay-chay-bo-revolution');
  });

  it('shows only the regular price when there is no sale', () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText(/1\.500\.000/)).toBeInTheDocument();
    expect(screen.queryByText(/1\.200\.000/)).not.toBeInTheDocument();
  });

  it('shows sale price plus original price with line-through when discounted', () => {
    render(<ProductCard {...baseProps} salePrice={1200000} />);
    expect(screen.getByText(/1\.200\.000/)).toBeInTheDocument();
    expect(screen.getByText(/1\.500\.000/)).toHaveClass('line-through');
  });

  it('ignores a salePrice that is not lower than the price', () => {
    render(<ProductCard {...baseProps} salePrice={1500000} />);
    expect(screen.getByText(/1\.500\.000/)).not.toHaveClass('line-through');
  });

  it('renders default Vietnamese badge labels', () => {
    render(<ProductCard {...baseProps} badges={['sale', 'new']} />);
    expect(screen.getByText('Giảm giá')).toBeInTheDocument();
    expect(screen.getByText('Mới')).toBeInTheDocument();
  });

  it('renders custom badge labels when provided', () => {
    render(<ProductCard {...baseProps} badges={['best-seller']} badgeLabels={{ 'best-seller': 'Best Seller' }} />);
    expect(screen.getByText('Best Seller')).toBeInTheDocument();
  });

  it('shows rating and review count when provided', () => {
    render(<ProductCard {...baseProps} rating={4.5} reviewCount={12} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });
});
