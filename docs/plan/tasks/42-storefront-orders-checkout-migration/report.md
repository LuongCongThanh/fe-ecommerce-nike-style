# Report 42

- **PR:** #135
- **Ngày merge:** 26/11/2026

## Đã làm

- `features/checkout/**` → `modules/checkout/**`, `features/orders/**` → `modules/orders/**` (`git mv`). Hậu tố: `schemas/checkout.schema.ts`, `services/order.service.ts`. `orderKeys` giữ làm public entry của orders.
- `useCreateOrder` lấy `clearCart` từ `useCart()`, bỏ import `cart.store`; xóa known violation cuối cùng (snapshot rỗng) và bảng ngoại lệ trong `docs/architecture.md`.
- Route mỏng: `checkout/page.tsx` render `CheckoutScreen` (form + sidebar + liên kết quay lại); `checkout/success/page.tsx` giữ `dynamic`, params, `getOrderOrNull` và render `CheckoutSuccess` (fallback orderId nằm trong UI). `checkout/layout.tsx` (AuthGuard) và `account/orders/**` đã mỏng, giữ nguyên.
- Boundary: entry app mới `CheckoutScreen`, `CheckoutSuccess`, `orders:services/order.service`; checkout được dùng `cart:testing/cart.fixture` (chỉ file test).
- Docs: `docs/architecture.md`, `docs/overview.md`, `docs/research/nextjs-naming-conventions.md` (link path).
- Test mới: `CheckoutSuccess.test` (3), `useCreateOrder.test` (2: không reservation giữ giỏ; thành công thì xóa giỏ qua `useCart` và redirect). Test cũ chỉ đổi path/import.

## Lệch so với spec và rủi ro còn lại

- E2E, full E2E ba engine và production Playwright: not run, theo quyết định người dùng 26/11/2026. Checkout/orders chỉ được kiểm bằng unit test.
- Reservation, requestKey, invalidate `orderKeys.list()`, redirect `?orderId=`, fallback orderId, return lifecycle không đổi.
- Token chưa đo (`pnpm tokens` cần sessionId).
- Cho task 44: `checkout/layout.tsx` và `account/layout.tsx` chỉ là `AuthGuard` bọc con, đã mỏng; không cần extract thêm. `src/features` không còn module; `eslint.boundaries.mjs` và `ROOTS`/logical path vẫn nhận cả `features/<module>` (dọn ở 44).

## Kiểm tra

Môi trường: nhánh `refactor/42-storefront-orders-checkout-migration`, Linux, pnpm, dev mode.

| Lệnh                                               | Exit | Kết quả                                 |
| -------------------------------------------------- | ---- | --------------------------------------- |
| `pnpm lint`                                        | 0    | ESLint + `lint:boundaries` (0 ngoại lệ) |
| `pnpm format:check`                                | 0    |                                         |
| `pnpm docs:check`                                  | 0    |                                         |
| `pnpm typecheck`                                   | 0    |                                         |
| `pnpm test`                                        | 0    | 1230 tests                              |
| `pnpm test:coverage`                               | 0    | 99.51/99.21/100/100, ngưỡng 50          |
| `pnpm build`                                       | 0    |                                         |
| `pnpm test:e2e`, `playwright.production.config.ts` | —    | not run — user decision                 |
