# Cơ chế Authentication: httpOnly session cookie, không dùng provider ngoài

Status: accepted — xem Decision #22 (`brainstorm-session.md`)

`08-authentication-authorization.md` đã chốt phạm vi (auth có trong MVP — Decision #20) và nguyên tắc bảo mật (không lưu token dài hạn ở `localStorage`, guard ở tầng route), nhưng chưa chọn cơ chế cụ thể. Đây là quyết định ảnh hưởng rộng: chạm cả 3 app, mọi route guard, `packages/hooks/use-auth`, và là nền cho `packages/api-sdk` giai đoạn mock-first lẫn khi có backend thật.

Quyết định đề xuất: dùng **session cookie `httpOnly` + `Secure` + `SameSite=Lax` tự quản lý** (không dùng NextAuth/Auth.js hay provider hosted như Clerk), đọc lại trong Next.js middleware để guard route. Lý do chọn tự quản lý thay vì Auth.js/Clerk: dự án chưa có backend thật (non-goal giai đoạn này — `frontend-overview.md`), nên một session cookie đơn giản (session id ký bằng secret, verify ở edge middleware) dễ mock bằng MSW hơn là tích hợp một thư viện có giả định sẵn về provider/backend. Khi có backend thật, hợp đồng "cookie httpOnly, middleware đọc lại" không đổi — chỉ đổi nơi issue cookie.

**Rủi ro kỹ thuật cần xác nhận trước khi implement** (đã phát hiện khi review, chưa validate bằng code thật): đề xuất mock trong `08-authentication-authorization.md` (MSW giả lập `Set-Cookie` để middleware đọc lại) có thể không hoạt động đúng như kỳ vọng — MSW ở chế độ browser (service worker) intercept request phía client, còn Next.js middleware chạy ở edge/server runtime; cookie được set qua response của service-worker-intercepted request không chắc được trình duyệt gắn vào request tiếp theo mà middleware server-side đọc được, tuỳ cách Next.js dev server và MSW tương tác. **Trước khi build `use-auth` ở Phase 5, cần spike nhỏ (1 route bảo vệ bằng middleware + 1 MSW handler set cookie) để xác nhận cơ chế mock này thật sự hoạt động** — nếu không, phương án thay thế là dùng MSW ở Node.js server-side mode (`setupServer`, chạy trong chính Next.js server thay vì service worker trình duyệt) cho riêng luồng auth.

## Considered Options

- **NextAuth/Auth.js**: bị hoãn quyết định vì thư viện này thiết kế xoay quanh có provider/backend thật (OAuth, database adapter, credentials backend) — tích hợp trước khi có backend thật tạo ra một lớp trừu tượng chưa có gì để trừu tượng hoá, ngược nguyên tắc YAGNI (Decision #10). Có thể cân nhắc lại khi backend thật được chốt.
- **Hosted provider (Clerk, Supabase Auth...)**: bị từ chối cho MVP vì thêm phụ thuộc bên ngoài và chi phí, trong khi dự án đang ở giai đoạn mock-first không có backend để tích hợp thật; để ngỏ nếu sau này muốn giảm chi phí vận hành auth tự viết.
- **Access token lưu `localStorage`/`sessionStorage`**: bị từ chối, vi phạm trực tiếp nguyên tắc bảo mật đã chốt trong `08-authentication-authorization.md` (không lưu token dài hạn ở `localStorage`).
