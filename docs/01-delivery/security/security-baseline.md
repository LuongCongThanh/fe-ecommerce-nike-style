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

### 1. Session và cookie

- Dùng session cookie `httpOnly` như đã chốt ở [`../adr/0004-authentication-mechanism.md`](../../00-core/adr/0004-authentication-mechanism.md).
- Cookie auth phải có tối thiểu: `HttpOnly`, `Secure` khi chạy HTTPS, `SameSite=Lax` hoặc chặt hơn nếu flow thực tế cho phép.
- Phải có thời hạn session rõ ràng. Giá trị khởi điểm cho MVP:
  - session idle timeout: `7 ngày`
  - tuyệt đối không để session vô hạn
- Logout phải xoá session server-side và làm client mất quyền ngay ở request kế tiếp.

### 2. Password và auth hardening

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

- Nếu auth dựa trên cookie, backend thật phải có chiến lược CSRF rõ ràng trước khi soft launch.
- Mốc tối thiểu chấp nhận:
  - `SameSite` được cấu hình đúng
  - với mọi mutation dùng cookie auth, phải có thêm một lớp bảo vệ CSRF nếu flow/browser profile yêu cầu
- Mọi form nhập liệu phải validate ở cả client và server.
- Không coi validation client là nguồn sự thật cuối cùng.

### 4. Authorization

- Route guard ở FE chỉ là lớp trải nghiệm. Quyền truy cập thật phải được enforce ở backend.
- Mọi action quản trị và xuất bản nội dung phải kiểm tra quyền ở server, không chỉ ẩn nút ở UI.
- Nếu RBAC chi tiết chưa mở rộng thêm, tối thiểu phải dùng matrix ở [`../architecture/backend/rbac-matrix.md`](../architecture/backend/rbac-matrix.md).

### 5. Content và CMS

- Nội dung rich text hoặc HTML từ CMS phải được sanitize trước khi render ở storefront.
- Preview content không được công khai mặc định:
  - chỉ user có quyền mới xem được
  - hoặc dùng preview token ngắn hạn có thể thu hồi
- Storefront public chỉ đọc content đã `published`.

### 6. Dữ liệu nhạy cảm và analytics

- Không gửi email, số điện thoại, địa chỉ giao hàng, reset token, session token, cookie value vào analytics.
- Event analytics chỉ được chứa identifier kỹ thuật nếu đã được chuẩn hoá và không làm lộ PII trực tiếp.
- Log lỗi không được ghi password, reset token, cookie auth, hay full address ở dạng raw.

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

- [ ] Cookie auth có `HttpOnly`, `Secure`, `SameSite` phù hợp.
- [ ] Session có timeout rõ ràng, logout làm mất hiệu lực session.
- [ ] Password policy và reset token policy được enforce ở backend.
- [ ] Login / register / forgot-password có rate limiting tối thiểu.
- [ ] Mutation dùng cookie auth có chiến lược CSRF rõ ràng trước soft launch.
- [ ] CMS content render công khai đã qua sanitize.
- [ ] Preview và publish có permission check ở server.
- [ ] Audit trail có cho inventory, order status, publish.
- [ ] Analytics và logs không chứa PII/raw secrets.

## Quan hệ với các tài liệu khác

- Scope auth và mock strategy: [`../architecture/frontend/08-authentication-authorization.md`](../architecture/frontend/08-authentication-authorization.md)
- API error contract: [`../architecture/backend/api-contracts.md`](../architecture/backend/api-contracts.md)
- Backend rollout: [`../architecture/backend/roadmap.md`](../architecture/backend/roadmap.md)
- Traceability: [`../traceability/requirements-traceability-matrix.md`](../traceability/requirements-traceability-matrix.md)
