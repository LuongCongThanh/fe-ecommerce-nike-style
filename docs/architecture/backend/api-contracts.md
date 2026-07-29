# API Contracts — Backend

## Nguyên tắc

API thật phải khớp contract mà Front-end đã giả định qua `packages/schemas` (Zod) và `packages/api-sdk` (MSW mock) — xem [`../frontend/api-integration.md`](../frontend/api-integration.md). Không thiết kế API contract mới độc lập với mock hiện có; nếu contract mock cần đổi, sửa `packages/schemas` trước, rồi mới cập nhật backend.

## Error envelope (đã chốt phía Front-end, backend phải theo)

```ts
{
  code: string,        // vd: "PRODUCT_OUT_OF_STOCK", "VALIDATION_ERROR"
  message: string,
  details?: Record<string, unknown>,
  traceId?: string,
}
```

Danh sách code khởi điểm (mở rộng dần theo feature): `VALIDATION_ERROR`, `OUT_OF_STOCK`, `PRICE_CHANGED`, `COUPON_INVALID`. **Không** thêm các code liên quan payment gateway thật (`PAYMENT_DECLINED`, `PAYMENT_REQUIRES_ACTION`...) — MVP chỉ COD (Decision #7), khác với danh sách gốc của `implementation-plan.md`.

## Pagination / filter / sort (đã chốt phía Front-end, backend phải theo)

```ts
// Request
{ page: number, pageSize: number, sort?: string, filter?: Record<string, string> }

// Response
{ items: T[], page: number, pageSize: number, total: number }
```

## Endpoint nháp (tham khảo từ `implementation-plan.md`, cần xác nhận lại theo domain model thật khi implement)

Danh sách dưới đây là điểm khởi đầu, **không phải hợp đồng đã chốt** — phải đối chiếu với `packages/schemas` thật trước khi code:

```
Auth:      POST /auth/register, /auth/login, /auth/logout, /auth/refresh,
           /auth/forgot-password, /auth/reset-password
Account:   GET/PATCH /me, GET/POST/PATCH/DELETE /me/addresses
Catalog:   GET /products, GET /products/:slug, GET /categories,
           GET /categories/:slug/products
Cart:      GET /cart, POST/PATCH/DELETE /cart/items, POST /cart/merge
Wishlist:  GET /wishlist, POST /wishlist/items, DELETE /wishlist/items/:productId
Checkout:  Validate cart → validate inventory → recalculate price
           → create order (COD, không có bước payment gateway)
Order:     GET /orders, GET /orders/:id
Admin:     CRUD /admin/products, /admin/categories, /admin/orders (cập nhật trạng thái)
CMS:       CRUD nội dung theo danh sách ở requirements/functional-requirements.md §3.3
```

Loại bỏ khỏi danh sách gốc của `implementation-plan.md`: mọi endpoint Payment (`/payment/*`, webhook) — ngoài phạm vi MVP.

## Việc cần làm trước khi implement

1. Đọc `packages/schemas` thật (khi đã có code) để lấy đúng shape, không dùng danh sách nháp ở trên làm đặc tả cuối.
2. Với mỗi entity, viết OpenAPI spec khớp Zod schema tương ứng — một schema, hai cách biểu diễn (runtime validation + docs), tránh lệch nhau.
