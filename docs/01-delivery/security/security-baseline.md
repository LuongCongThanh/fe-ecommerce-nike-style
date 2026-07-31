# Security Baseline

> File này tách cụm từ quá rộng "`OWASP-safe`" thành các yêu cầu bảo mật tối thiểu có thể kiểm tra được cho MVP hiện tại. Nếu một tài liệu khác chỉ nói "an toàn" hoặc "OWASP-safe" mà không cụ thể hơn, ưu tiên file này để hiểu baseline phải đạt.

## Mục đích

- Biến các nguyên tắc bảo mật hiện có thành yêu cầu cụ thể, có thể thiết kế, kiểm thử và audit.
- Đặt ngưỡng tối thiểu cho `storefront`, `admin`, `cms` trong giai đoạn mock-first và khi chuyển sang API thật.
- Giảm rủi ro mỗi module tự hiểu "an toàn" theo một kiểu khác nhau.

## Phạm vi

- Áp dụng cho auth, account, checkout, admin, cms, analytics, content input.
- Áp dụng cho cả mock-first và API thật. Mock có thể đơn giản hơn về hạ tầng, nhưng không được tạo thói quen trái với baseline này.
- Không bao gồm compliance pháp lý chi tiết ngoài các yêu cầu kiểm soát dữ liệu cơ bản.

## Baseline bắt buộc

### 1. Token và cookie

- Dùng JWT access token ngắn hạn + rotating opaque refresh token như đã chốt ở [`ADR 0010`](../../00-core/adr/0010-jwt-access-with-rotating-refresh.md).
- Access token chỉ giữ trong memory, không lưu `localStorage`/`sessionStorage`.
- Refresh cookie phải có tối thiểu: `HttpOnly`, `Secure`, `SameSite=Lax` ở production HTTPS.
- Mỗi app dùng refresh cookie first-party, host-only trên domain của chính app; browser gọi same-origin `/api/*` qua reverse proxy (Decision #67, ADR 0011).
- Không mở credentialed cross-site refresh trực tiếp tới Backend domain và không phụ thuộc third-party cookie.
- Backend chỉ lưu hash refresh token cùng token-family metadata; mỗi lần refresh phải rotate token và phát hiện reuse.
- TTL `storefront`: access JWT `10 phút`, refresh idle `7 ngày`, absolute family lifetime `30 ngày`.
- TTL `admin`/`cms`: access JWT `5 phút`, refresh idle `8 giờ`, absolute family lifetime `24 giờ`.
- Logout phải revoke refresh-token family; access token đã phát hành chỉ được phép tồn tại tới TTL ngắn đã chốt.

### 2. Password và auth hardening

- Password phải được hash bằng Argon2id qua thư viện Node `argon2`; không lưu plaintext và không dùng encryption có thể giải ngược.
- Baseline Argon2id tối thiểu là `m=19456 KiB`, `t=2`, `p=1`. Phải benchmark trên hạ tầng production và có thể tăng cost nếu vẫn đáp ứng ngân sách latency/tài nguyên; không được hạ dưới baseline mà không có quyết định bảo mật mới.
- Lưu encoded PHC string có algorithm, parameters và salt ngẫu nhiên do thư viện tạo. Khi login thành công với parameters cũ, tạo hash mới theo cấu hình hiện hành.
- Không tạo bcrypt hash mới. Nếu import account legacy dùng bcrypt, chỉ verify để migration rồi rehash sang Argon2id sau lần đăng nhập thành công.
- Phase 0 chưa dùng pepper; chỉ bổ sung sau khi có secrets manager, rotation và recovery procedure rõ ràng.
- Password người dùng phải dài tối thiểu `10` ký tự.
- Không chấp nhận password nằm trong deny-list phổ biến như `12345678`, `password`, `qwerty123`.
- Password reset token phải:
  - dùng một lần
  - có hạn dùng rõ ràng, giá trị khởi điểm `15 phút`
  - bị vô hiệu sau khi reset thành công
- Auth endpoint phải có rate limiting tối thiểu cho:
  - đăng nhập
  - đăng ký
  - quên mật khẩu
  - reset mật khẩu
- Baseline khởi điểm cho MVP:
  - `5` lần thử thất bại / `15 phút` / theo IP + identifier cho login
  - vượt ngưỡng thì trả lỗi throttle, không tiết lộ account có tồn tại hay không

### 3. CSRF và input validation

- Các endpoint dùng refresh cookie phải có chiến lược CSRF rõ ràng trước khi soft launch.
- Mốc tối thiểu chấp nhận:
  - refresh cookie `SameSite=Lax`, host-only và chỉ gửi qua same-origin `/api/*`
  - refresh/logout kiểm tra CSRF token/header và `Origin`/Fetch Metadata phù hợp
- Mọi form nhập liệu phải validate ở cả client và server.
- Không coi validation client là nguồn sự thật cuối cùng.

### 4. Authorization

- Route guard ở FE chỉ là lớp trải nghiệm. Quyền truy cập thật phải được enforce ở backend.
- Mọi action quản trị và xuất bản nội dung phải kiểm tra quyền ở server, không chỉ ẩn nút ở UI.
- Nếu RBAC chi tiết chưa mở rộng thêm, tối thiểu phải dùng matrix ở [`../architecture/backend/rbac-matrix.md`](../architecture/backend/rbac-matrix.md).

### 5. Content và CMS

- Nội dung rich text hoặc HTML từ CMS phải được sanitize trước khi render ở storefront.
- Media upload chỉ nhận từ actor có quyền; enforce allow-list type, byte/dimension limit và xác minh MIME/magic bytes phía server. Object key do server sinh, không dùng raw filename làm key/path.
- Không buffer toàn file trong process memory và không ghi upload vào local disk production. Draft/preview object giữ private; publish mới cho phép public CDN delivery.
- Preview content không được công khai mặc định:
  - chỉ user có quyền mới xem được
  - hoặc dùng preview token ngắn hạn có thể thu hồi
- Storefront public chỉ đọc content đã `published`.

### 6. Dữ liệu nhạy cảm và analytics

- Không gửi email, số điện thoại, địa chỉ giao hàng, reset token, session token, cookie value vào analytics.
- Event analytics chỉ được chứa identifier kỹ thuật nếu đã được chuẩn hoá và không làm lộ PII trực tiếp.
- Log lỗi không được ghi password, reset token, access/refresh token, cookie auth, hay full address ở dạng raw.
- Background job payload không lưu raw password/reset/access/refresh token; ưu tiên immutable identifier để worker đọc dữ liệu cần thiết theo quyền tối thiểu.

### 7. Audit trail tối thiểu

- Phải có audit trail cho các action sau:
  - cập nhật tồn kho
  - cập nhật trạng thái đơn hàng
  - publish/unpublish content
  - thay đổi quyền quản trị nếu có
- Mỗi audit entry tối thiểu gồm:
  - actor
  - action
  - target type
  - target id
  - timestamp
  - summary thay đổi

### 8. Error handling và traceability

- Error response phải theo envelope đã mô tả ở [`../architecture/backend/api-contracts.md`](../architecture/backend/api-contracts.md).
- Luồng critical như auth, checkout, order, publish cần có `traceId` hoặc request correlation tương đương khi vào backend thật.
- Không trả lỗi chi tiết quá mức có thể giúp enumerate account hoặc lộ implementation nội bộ.

## Security acceptance checklist

- [ ] Refresh cookie có `HttpOnly`, `Secure`, `SameSite` phù hợp; access token không nằm trong browser storage.
- [ ] Session có timeout rõ ràng, logout làm mất hiệu lực session.
- [ ] Password policy và reset token policy được enforce ở backend.
- [ ] Password hash dùng Argon2id đúng baseline; test verify và rehash-on-login cover parameters cũ.
- [ ] Login / register / forgot-password có rate limiting tối thiểu.
- [ ] Endpoint dùng refresh cookie có chiến lược CSRF rõ ràng trước soft launch.
- [ ] CMS content render công khai đã qua sanitize.
- [ ] Media upload từ chối file sai type/size/content; draft asset không truy cập public và publish transition được authorization/audit.
- [ ] Preview và publish có permission check ở server.
- [ ] Audit trail có cho inventory, order status, publish.
- [ ] Analytics và logs không chứa PII/raw secrets.

## Quan hệ với các tài liệu khác

- Scope auth và mock strategy: [`../FE/FE-ARCHITECTURE.md`](../FE/FE-ARCHITECTURE.md) §11
- API error contract: [`../architecture/backend/api-contracts.md`](../architecture/backend/api-contracts.md)
- Backend rollout: [`../architecture/backend/roadmap.md`](../architecture/backend/roadmap.md)
- Traceability: [`../traceability/requirements-traceability-matrix.md`](../traceability/requirements-traceability-matrix.md)
