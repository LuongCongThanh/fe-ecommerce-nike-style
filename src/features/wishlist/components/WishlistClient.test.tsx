import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/lib/api/testing/msw-server';

import { renderWithProviders } from '@/helpers/render';
import { WishlistClient } from '@/features/wishlist/components/WishlistClient';
import { clearCart, resetCartState, useCartStore } from '@/features/cart/stores/cart.store';
import { resetWishlistState, useWishlistStore } from '@/features/wishlist/stores/wishlist.store';

// Real seeded Products from `src/lib/api/mocks/catalog-fixtures.ts`.
const PRODUCT_WITH_VARIANT_SLUG = 'running-shoe-alpha'; // p-1 — has Color x Size
const PRODUCT_WITH_VARIANT_ID = 'p-1';
const PRODUCT_NO_VARIANT_ID = 'p-3'; // single hidden SKU, no Variant

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  push.mockClear();
  localStorage.clear();
  resetWishlistState();
  resetCartState();
  clearCart();
});

function renderWishlistClient() {
  return renderWithProviders(<WishlistClient locale="vi" />);
}

describe('WishlistClient — move to cart (FE-INT, issue #14)', () => {
  it('navigates to the PDP for a Product with a Variant, instead of guessing Color/Size', async () => {
    useWishlistStore.getState().addItem(PRODUCT_WITH_VARIANT_ID);
    renderWishlistClient();

    const button = await screen.findByRole('button', { name: 'Thêm vào giỏ' });
    fireEvent.click(button);

    expect(push).toHaveBeenCalledWith(`/vi/products/${PRODUCT_WITH_VARIANT_SLUG}`);
    // Not added to the cart directly, and stays on the wishlist — only navigation happened.
    expect(useCartStore.getState().items).toEqual([]);
    expect(useWishlistStore.getState().items).toEqual([{ productId: PRODUCT_WITH_VARIANT_ID }]);
  });

  it('adds a Product with no Variant straight to the cart and removes it from the wishlist', async () => {
    useWishlistStore.getState().addItem(PRODUCT_NO_VARIANT_ID);
    renderWishlistClient();

    const button = await screen.findByRole('button', { name: 'Thêm vào giỏ' });
    fireEvent.click(button);

    expect(push).not.toHaveBeenCalled();
    await waitFor(() => expect(useCartStore.getState().items).toHaveLength(1));
    expect(useWishlistStore.getState().items).toEqual([]);
  });

  it('removes an item directly via the trash button, without moving it to cart', async () => {
    useWishlistStore.getState().addItem(PRODUCT_NO_VARIANT_ID);
    renderWishlistClient();

    const button = await screen.findByRole('button', { name: 'Xoá khỏi yêu thích' });
    fireEvent.click(button);

    await waitFor(() => expect(screen.getByText('Danh sách yêu thích đang trống')).toBeInTheDocument());
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('shows an empty state when the wishlist has nothing in it', () => {
    renderWishlistClient();
    expect(screen.getByText('Danh sách yêu thích đang trống')).toBeInTheDocument();
  });
});
