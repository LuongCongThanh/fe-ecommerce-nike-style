import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCategoryTree } from '@/lib/api/endpoints/catalog';
import { MobileNav } from '@/layouts/components/MobileNav';
import { renderWithProviders } from '@/testing/render';

vi.mock('@/lib/api/endpoints/catalog', () => ({ getCategoryTree: vi.fn() }));

const TREE = [{ id: 'c1', slug: 'men', name: 'Nam', children: [{ id: 'c2', slug: 'men-shoes', name: 'Giày nam', children: [] }] }];

beforeEach(() => {
  vi.mocked(getCategoryTree).mockResolvedValue(TREE);
});

describe('MobileNav', () => {
  it('opens the sheet with the all-products link and closes it on navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MobileNav locale="vi" />);

    expect(screen.queryByText('Tất cả sản phẩm')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    const link = screen.getByRole('link', { name: 'Tất cả sản phẩm' });
    expect(link).toHaveAttribute('href', '/vi/products');

    await user.click(link);
    expect(screen.queryByRole('link', { name: 'Tất cả sản phẩm' })).not.toBeInTheDocument();
  });

  it('lists root categories and expands to their localized sub-category links', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MobileNav locale="en" />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.click(await screen.findByRole('button', { name: 'Nam' }));

    expect(screen.getByRole('link', { name: 'Tất cả Nam' })).toHaveAttribute('href', '/en/categories/men');
    expect(screen.getByRole('link', { name: 'Giày nam' })).toHaveAttribute('href', '/en/categories/men-shoes');
  });
});
