# Plan 42: Orders và checkout chuyển sang modules, giữ workflow và route contract

Branch: `refactor/42-storefront-orders-checkout-migration` (từ `dev`). Một PR, không đổi UI/URL/hành vi.

## Blocker

Task 41 `done` (PR #131, #134). Task 40 (auth) và 43 (home) không chạm checkout/orders.

## Mapping (cũ → đích)

| Cũ                                           | Đích                                                         |
| -------------------------------------------- | ------------------------------------------------------------ |
| `features/checkout/**`                       | `modules/checkout/**` (`git mv`)                             |
| `features/checkout/schemas/checkout.ts`      | `modules/checkout/schemas/checkout.schema.ts`                |
| `features/orders/**`                         | `modules/orders/**` (`git mv`)                               |
| `features/orders/services/order.ts`          | `modules/orders/services/order.service.ts`                   |
| UI trong `app/.../checkout/page.tsx`         | `modules/checkout/components/CheckoutScreen.tsx` (client)    |
| UI trong `app/.../checkout/success/page.tsx` | `modules/checkout/components/CheckoutSuccess.tsx` (thuần UI) |

`orderKeys` giữ tại `modules/orders/queries/orderKeys.ts` làm public entry cho checkout. Không có file type riêng để đổi
hậu tố `.types`.

## Route mỏng

- `checkout/page.tsx`: `'use client'`, `use(params)` rồi render `CheckoutScreen`. Form/orchestration chuyển vào module.
- `checkout/success/page.tsx`: giữ `dynamic = 'force-dynamic'`, `params`/`searchParams`, gọi `getOrderOrNull`, render
  `CheckoutSuccess` với `locale`, `orderId`, `order`. Fallback orderId nằm trong UI, không đổi.
- `checkout/layout.tsx`, `account/orders/**`: đã chỉ là AuthGuard hoặc nối module; giữ nguyên.

## Consumer, config

- Import đổi theo sed cơ học (`@/features/{checkout,orders}` → `@/modules/...`, hậu tố mới), `docs/storefront/overview.md`.
- `useCreateOrder`: `clearCart` lấy từ `useCart()`, bỏ import `cart.store`.
- `scripts/check-module-boundaries.ts`: entry app mới (`CheckoutScreen`, `CheckoutSuccess`, `order.service`), bỏ 3 entry cũ
  của checkout page và `orders:services/order`; xóa known violation `useCreateOrder → cart store` (snapshot rỗng).
- `docs/storefront/architecture.md`: cây, danh sách module, bảng ngoại lệ.

## Seams kiểm thử

Test hiện có chỉ đổi path. Mới: `CheckoutSuccess.test` (có order, fallback orderId, không có gì) và `useCreateOrder.test`
(không reservation giữ nguyên giỏ; thành công thì `clearCart` qua `useCart` và redirect). Giỏ seed/đọc qua
`modules/cart/testing/cart.fixture`. Chính sách 26/11/2026: không E2E, unit khoảng 50%.

## Rủi ro và rollback

- Import sót: `tsc`, ESLint, `lint:boundaries`. Reservation, requestKey (ref một lần), invalidate `orderKeys.list()`,
  redirect `?orderId=`, fallback orderId, return lifecycle không đổi.
- Rollback: revert PR (path, route extract, test, rule và docs là một đơn vị).
