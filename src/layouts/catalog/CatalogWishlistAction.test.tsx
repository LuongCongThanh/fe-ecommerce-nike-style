import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { CatalogWishlistAction } from '@/layouts/catalog/CatalogWishlistAction';
import { renderWithProviders } from '@/testing/render';

beforeEach(() => {
  localStorage.clear();
});

describe('CatalogWishlistAction', () => {
  it('starts unwishlisted', () => {
    renderWithProviders(<CatalogWishlistAction productId="1" />);
    expect(screen.getByRole('button', { name: 'Thêm vào yêu thích' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles on and back off', () => {
    renderWithProviders(<CatalogWishlistAction productId="1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Thêm vào yêu thích' }));
    expect(screen.getByRole('button', { name: 'Bỏ khỏi yêu thích' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Bỏ khỏi yêu thích' }));
    expect(screen.getByRole('button', { name: 'Thêm vào yêu thích' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shares state between two actions for the same product', () => {
    renderWithProviders(
      <>
        <CatalogWishlistAction productId="7" />
        <CatalogWishlistAction productId="7" />
      </>,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Thêm vào yêu thích' })[0]!);

    expect(screen.getAllByRole('button', { name: 'Bỏ khỏi yêu thích' })).toHaveLength(2);
  });
});
