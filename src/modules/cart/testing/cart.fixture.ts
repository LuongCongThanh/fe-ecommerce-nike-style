import type { CartItem } from '@/modules/cart/stores/cart.store';
import { clearCart, getCartItems, resetCartState } from '@/modules/cart/stores/cart.store';

/**
 * Owner test entry: lets other modules' tests start from an empty cart and read what ended up in it
 * without importing the private store. Allowlisted for test files only (`testOnly` in the boundary policy).
 */
export function resetCartForTest(): void {
  resetCartState();
  clearCart();
}

export function readCartItemsForTest(): CartItem[] {
  return getCartItems();
}
