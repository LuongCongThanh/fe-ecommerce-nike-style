# BE

Đây là tài liệu chính để làm Backend.

## 1. Hiện trạng

Backend chưa được implement và cũng chưa chốt công nghệ cuối cùng.

Những gì đã biết:

- FE đang đi theo `mock-first`
- Backend sẽ được gắn vào sau
- Backend phải tôn trọng contract mà FE đã chốt

## 2. Mục tiêu Backend

Backend phải phục vụ:

- auth/account
- catalog
- inventory
- cart
- wishlist
- checkout COD
- order
- Admin APIs
- CMS APIs

## 3. Nguyên tắc Backend

- `contract-first`
- Ưu tiên modular, dễ mở rộng
- Authorization phải enforce ở server
- Security baseline phải là built-in concern
- Không làm backend lệch shape so với mock API

## 4. API Principles

- Response shape phải ổn định
- Error envelope phải thống nhất
- Filter/sort/pagination contract phải rõ
- Mock API và real API phải cùng shape
- FE đổi từ mock sang real API không được đòi hỏi rewrite component

## 5. Domain cốt lõi

Các khái niệm backend bắt buộc phải tôn trọng:

- `Product`
- `Variant`
- `SKU`
- `Category`
- `Gender`
- `CartItem`
- `Reservation`
- `Order`
- `OrderItem`
- `WishlistItem`

## 6. Luồng nghiệp vụ quan trọng

### Catalog

- Product có thể có hoặc không có variant
- Giá và stock gắn với SKU

### Cart

- `CartItem` tham chiếu trực tiếp `skuId`
- Merge cart là cộng quantity rồi clamp theo `available`

### Wishlist

- `WishlistItem` tham chiếu `Product`
- Merge wishlist là union theo Product

### Checkout/Order

- Chỉ `COD`
- Reservation bắt đầu khi checkout start
- Order item phải snapshot dữ liệu tại thời điểm mua
- Place order cần xử lý `idempotency`

### Return

- Return window là `7 ngày`
- Return cần approval thủ công
- Refund COD là tracked-manually

## 7. Auth và Authorization

- Direction hiện tại là `httpOnly` session cookie
- Backend phải support session invalidation
- Backend phải enforce route/action permission
- Admin/CMS RBAC chi tiết vẫn là open question

## 8. Security Minimum

Backend phải có tối thiểu:

- password policy
- reset token TTL
- one-time-use reset token
- rate limiting cho auth endpoints
- CSRF strategy nếu dùng cookie auth
- sanitize CMS public content
- audit trail cho các action nhạy cảm
- không leak PII/raw secret vào log

## 9. Observability Minimum

Phần này hiện chưa chốt sâu, nhưng backend tương lai tối thiểu phải có:

- structured logging hoặc logging đủ dùng
- trace/request correlation cho flow critical
- audit trail

`Tooling` cụ thể vẫn chưa chốt.

## 10. Delivery Order

Thứ tự hợp lý cho Backend:

1. Chốt tech stack
2. Scaffold backend foundation
3. Auth/account
4. Catalog
5. Inventory
6. Cart/wishlist
7. Checkout/order
8. Admin/CMS APIs
9. Security/observability hardening
10. Real integration với FE

## 11. Open Questions

- Chọn framework backend nào
- Database nào
- Infra nào
- RBAC chi tiết cho Admin/CMS
- Monitoring/logging stack

## 12. Nguồn gốc nội dung

File này rút gọn từ:

- `01-delivery/architecture/backend`
- `01-delivery/specification/technical-design.md`
- `00-core/glossary.md`
- `00-core/decision-log.md`
