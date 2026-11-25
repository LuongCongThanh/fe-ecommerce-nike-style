# Manifest phạm vi — Orders và checkout giữ workflow và route contract

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng owner đích trong mapping. Đây không phải approved.files hay quyền sửa mọi file. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/features/checkout/components/CheckoutClient.tsx`
- `src/features/checkout/components/OrderSummary.tsx`
- `src/features/checkout/components/checkout-flow.test.tsx`
- `src/features/checkout/constants/payment-config.ts`
- `src/features/checkout/hooks/useCheckoutForm.ts`
- `src/features/checkout/hooks/useRedirectIfCartEmpty.ts`
- `src/features/checkout/queries/useCreateOrder.ts`
- `src/features/checkout/queries/useReservation.test.tsx`
- `src/features/checkout/queries/useReservation.ts`
- `src/features/checkout/schemas/checkout.ts`
- `src/features/orders/components/OrderStatusBadge.tsx`
- `src/features/orders/formatOrderDate.test.ts`
- `src/features/orders/formatOrderDate.ts`
- `src/features/orders/order-detail/components/OrderDetailClient.test.tsx`
- `src/features/orders/order-detail/components/OrderDetailClient.tsx`
- `src/features/orders/order-detail/queries/useCancelOrder.ts`
- `src/features/orders/order-detail/queries/useOrder.ts`
- `src/features/orders/order-detail/queries/useRequestReturn.ts`
- `src/features/orders/order-list/components/OrdersClient.test.tsx`
- `src/features/orders/order-list/components/OrdersClient.tsx`
- `src/features/orders/order-list/queries/useOrders.test.tsx`
- `src/features/orders/order-list/queries/useOrders.ts`
- `src/features/orders/queries/orderKeys.ts`
- `src/features/orders/services/order.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/(shop)/account/orders/[id]/page.tsx`
- `src/app/[locale]/(shop)/account/orders/page.tsx`
- `src/app/[locale]/(shop)/checkout/page.tsx`
- `src/app/[locale]/(shop)/checkout/success/page.tsx`

## Config/docs cần đối chiếu

- `eslint.config.mjs`
- `docs/architecture.md` và tài liệu owner tương ứng ở spec; chỉ cập nhật hiện trạng đã triển khai.

## Test cũ được thích ứng trong scope

- `src/features/checkout/components/checkout-flow.test.tsx`
- `src/features/checkout/queries/useReservation.test.tsx`
- `src/features/orders/formatOrderDate.test.ts`
- `src/features/orders/order-detail/components/OrderDetailClient.test.tsx`
- `src/features/orders/order-list/components/OrdersClient.test.tsx`
- `src/features/orders/order-list/queries/useOrders.test.tsx`

Các test mới đi cạnh owner hoặc e2e/production theo policy. Với consumer test khác chưa xuất hiện ở scan, bổ sung manifest/file scope trước triển khai; không thay assertion để né regression. Không công khai private stores để cứu setup test.
