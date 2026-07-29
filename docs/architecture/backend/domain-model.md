# Domain Model — Backend

## Đã chốt chính thức (kế thừa nguyên trạng từ `glossary.md`)

Không định nghĩa lại — backend phải dùng đúng định nghĩa đã có ở [`../../glossary.md`](../../glossary.md):

- `Locale`, `Locale mặc định`, `Localized Text`, `Market`
- `Product`, `Variant`, `SKU`, `Category`, `Gender`
- `CartItem`, `Merge Cart`, `Reservation`, `Order` (state machine COD-only), `OrderItem` — chốt qua phiên `grilling` + `domain-modeling` riêng (Decision #35–#39), xem [`../../glossary.md`](../../glossary.md#cart--order).
- `WishlistItem`, `Merge Wishlist`, `Move to cart` (Decision #40–#42), xem [`../../glossary.md`](../../glossary.md#wishlist).
- Return window, Return approval, Hoàn tiền COD (Decision #43–#45), xem [`../../glossary.md`](../../glossary.md#return--refund).

Điểm quan trọng cho backend: `Price` và tồn kho gắn ở cấp **SKU**, không phải Product (glossary.md — SKU). Một Product có 0 hoặc nhiều Variant; khi 0 Variant, Product ánh xạ 1-1 với một SKU ẩn.

**Inventory**: tách `on_hand` / `reserved` / `available` (`available = on_hand - reserved`) — đã chốt cần tách 3 field này (không phải một `quantity` duy nhất) để tránh oversell; `reserved` chỉ tăng khi bắt đầu Checkout (Decision #37), chuyển thành `committed` ngay khi Order tạo thành công (Decision #38), giải phóng lại `available` khi Order `CANCELLED` hoặc `RETURNED` hoàn tất (xem `glossary.md` — Order).

## Chưa chốt — tham khảo từ `implementation-plan.md`, cần một phiên grilling riêng trước khi ghi vào `glossary.md`

Chỉ còn lại **Promotion**:

### Promotion
- MVP không bắt buộc có promotion/coupon — chưa có trong danh sách bắt buộc ở `requirements/functional-requirements.md` §3.1. Nếu cần, tham khảo `implementation-plan.md` §26 nhưng phải xác nhận scope trước.

## Việc cần làm trước khi implement backend thật

1. Chạy phiên `grilling` + `domain-modeling` cho Promotion nếu quyết định đưa vào scope, đối chiếu với dữ liệu mock thật đang có trong `packages/schemas`/`packages/api-sdk`.
2. Ghi kết quả chính thức vào `glossary.md`, xoá phần "chưa chốt" tương ứng khỏi file này (file này chỉ là placeholder, không phải nơi lưu domain model đã chốt lâu dài).
