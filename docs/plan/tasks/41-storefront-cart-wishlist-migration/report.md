# Report 41

- **PR:** #131
- **Ngày merge:** 26/11/2026

## Đã làm

- `features/cart/**` → `modules/cart/**`, `features/wishlist/**` → `modules/wishlist/**` (`git mv`, 13 file gồm 3 test). Storage key `cart-storage-v2`, hydration, clamp tồn kho, undo/toast, merge khi login và public action giữ nguyên; không đổi UI/URL.
- Import/consumer đổi cùng lượt: 2 route page, `layouts/{Header,useMergeGuestDataOnLogin}`, `layouts/catalog/CatalogWishlistAction`, checkout (`CheckoutClient`, `OrderSummary`, `useRedirectIfCartEmpty`, `useCreateOrder`, `useReservation` + test), comment `e2e/support/session.ts`, `docs/overview.md`, fixture của script boundary.
- Test entry của owner `modules/cart/testing/cart.fixture.ts` (`resetCartForTest`, `readCartItemsForTest`). `WishlistClient.test` dùng entry này thay private cart store, assertion giữ nguyên.
- `scripts/check-module-boundaries.ts`: thêm `PublicEntry.testOnly`, entry `cart:testing/cart.fixture` cho wishlist chỉ với file test; xóa known violation `wishlist:WishlistClient.test → cart store` (còn 2: auth/40, checkout/42).
- Docs: `docs/architecture.md` (đường dẫn, bảng ngoại lệ, test entry), status task.

## Lệch so với spec và rủi ro còn lại

- E2E, full E2E ba engine và production Playwright: not run, theo quyết định người dùng 26/11/2026. Không coi là pass; cart/merge/checkout chỉ được kiểm bằng unit test hiện có.
- `checkout/queries/useCreateOrder → cart store` thuộc task 42, giữ nguyên.
- Test mới: 1 test boundary (`testOnly` cho phép file test, chặn production). Coverage repo 99%.
- Token chưa đo (`pnpm tokens` cần sessionId).
- Hợp nhất sau: nếu task 40 đổi path auth, cart/wishlist không import auth nên không bị ảnh hưởng.
- `plan.md` viết sau bước chuyển file cơ học.

## Kiểm tra

Môi trường: nhánh `refactor/41-storefront-cart-wishlist-migration`, Linux, pnpm, dev mode.

| Lệnh                                                                                             | Exit | Kết quả                                 |
| ------------------------------------------------------------------------------------------------ | ---- | --------------------------------------- |
| `pnpm lint`                                                                                      | 0    | ESLint + `lint:boundaries` (2 ngoại lệ) |
| `pnpm format:check`                                                                              | 0    |                                         |
| `pnpm docs:check`                                                                                | 0    |                                         |
| `pnpm typecheck`                                                                                 | 0    |                                         |
| `pnpm test`                                                                                      | 0    | 1225 tests (sau merge dev)              |
| `pnpm test:coverage`                                                                             | 0    | 99.51/99.21/100/100, ngưỡng 50          |
| `pnpm build`                                                                                     | 0    |                                         |
| CI PR #131 (lint, typecheck, unit, coverage, build, production browser Chromium, docs, contract) | 0    | pass                                    |
| `pnpm test:e2e`                                                                                  | —    | not run — user decision                 |
| `playwright.production.config.ts`                                                                | —    | not run — user decision                 |

## Cho task 42

Import cart công khai: `@/modules/cart/hooks/useCart` (`useCart`, `CartLine`); `clearCart` lấy từ kết quả `useCart()`. Xóa cạnh `useCreateOrder → cart store` cùng lượt 42.
