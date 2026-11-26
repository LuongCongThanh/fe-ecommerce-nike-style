# Plan 41: Cart và wishlist chuyển sang modules, giữ persistence và merge

Branch: `refactor/41-storefront-cart-wishlist-migration` (từ `dev`). Một PR, không đổi UI/URL/hành vi/storage.

## Blocker

Task 39 `done` (PR #127, #128). Task 40 (auth) và 43 (home) chạy song song; cart/wishlist không import auth.

## Mapping (cũ → đích)

| Cũ                                                 | Đích                                                      |
| -------------------------------------------------- | --------------------------------------------------------- |
| `features/cart/**` (components, hooks, stores)     | `modules/cart/**` (`git mv`)                              |
| `features/wishlist/**` (components, hooks, stores) | `modules/wishlist/**` (`git mv`)                          |
| test của wishlist đọc private cart store           | `modules/cart/testing/cart.fixture.ts` (owner test entry) |

## Consumer, mock string, config

- Import đổi: 2 route page, `layouts/{Header,useMergeGuestDataOnLogin}`, `layouts/catalog/CatalogWishlistAction`,
  checkout (`CheckoutClient`, `OrderSummary`, `useRedirectIfCartEmpty`, `useCreateOrder`, `useReservation` + test),
  import nội bộ, comment `e2e/support/session.ts`, `docs/overview.md`, fixture của script boundary và guard test.
- `scripts/check-module-boundaries.ts`: xóa known violation `wishlist:WishlistClient.test → cart store`; thêm
  `PublicEntry.testOnly` và entry `cart:testing/cart.fixture` cho wishlist (chỉ file test).
- `useCreateOrder → cart store` thuộc task 42 (giữ nguyên).
- Docs: `docs/architecture.md` (bảng ngoại lệ, đường dẫn, test entry).

## Seams kiểm thử

`WishlistClient.test` dùng fixture owner thay cho private store, assertion giữ. Test boundary mới: entry `testOnly`
chấp nhận file test, từ chối file production. Chính sách 26/11/2026: không E2E, unit khoảng 50%.

## Bước

1. [x] `git mv` + đổi import.
2. [x] Test entry cart + boundary `testOnly`, xóa ngoại lệ.
3. [x] Docs, status.
4. [ ] Gates, report, metric.

## Rủi ro và rollback

- Import sót: `tsc`, ESLint, `lint:boundaries` bắt. Storage key `cart-storage-v2`, wishlist key, hydration, clamp, merge không đổi.
- Rollback: revert PR (path/import/fixture/config/docs một đơn vị); không xóa storage.
