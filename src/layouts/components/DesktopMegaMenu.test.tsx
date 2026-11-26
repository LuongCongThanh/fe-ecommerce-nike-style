import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DesktopMegaMenu } from '@/layouts/components/DesktopMegaMenu';
import { getCategoryTree } from '@/integrations/backend/endpoints/catalog';
import { renderWithProviders } from '@/testing/render';

vi.mock('@/integrations/backend/endpoints/catalog', () => ({ getCategoryTree: vi.fn() }));

const TREE = [
  { id: 'c1', slug: 'men', name: 'Nam', children: [{ id: 'c11', slug: 'men-shoes', name: 'Giày nam', children: [] }] },
  { id: 'c2', slug: 'women', name: 'Nữ', children: [{ id: 'c21', slug: 'women-bags', name: 'Túi nữ', children: [] }] },
];

beforeEach(() => {
  vi.mocked(getCategoryTree).mockResolvedValue(TREE);
});

describe('DesktopMegaMenu', () => {
  it('renders nothing until categories are available', () => {
    vi.mocked(getCategoryTree).mockReturnValue(new Promise(() => undefined));
    const { container } = renderWithProviders(<DesktopMegaMenu locale="vi" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('opens on hover showing the first category and its localized links', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DesktopMegaMenu locale="vi" />);

    await user.hover(await screen.findByRole('button', { name: 'Danh mục' }));

    expect(screen.getByRole('link', { name: 'Xem tất cả' })).toHaveAttribute('href', '/vi/categories/men');
    expect(screen.getByRole('link', { name: 'Giày nam' })).toHaveAttribute('href', '/vi/categories/men-shoes');
  });

  it('switches the active category on hover', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DesktopMegaMenu locale="en" />);

    await user.hover(await screen.findByRole('button', { name: 'Danh mục' }));
    await user.hover(screen.getByRole('button', { name: 'Nữ' }));

    const sub = await screen.findByRole('link', { name: 'Túi nữ' });
    expect(sub).toHaveAttribute('href', '/en/categories/women-bags');
  });
});
