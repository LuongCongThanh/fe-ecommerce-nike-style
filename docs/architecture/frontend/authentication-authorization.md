# Authentication & Authorization

## Phạm vi auth trong MVP [Đã chốt — Decision #20]

Authentication **có** trong MVP storefront: sign in/up, account, order history, wishlist gắn user (Phương án A trong bản thảo trước của tài liệu này). Xác nhận trực tiếp, không kèm giải thích thêm — ghi nhận tại Decision #20 trong `brainstorm-session.md`.

**Admin/CMS luôn cần authentication** (không phải câu hỏi mở, vì đã có khái niệm role trong ADR 0002) — độc lập với quyết định trên.

**Hệ quả cụ thể**:

- `packages/hooks` cần `use-auth` thật, không phải "để sẵn đó" — build ngay khi vào Phase 5 (Storefront Features) theo `roadmap.md`.
- `routing.md` route group `(account)/` (profile, orders, wishlist) chính thức nằm trong scope MVP, không còn là route "dự phòng".
- **[Mở — mới phát sinh]**: danh sách role cụ thể cho `admin`/`cms` (Super Admin, Catalog Manager, Order Operator, Content Editor... như liệt kê tham khảo trong `FE-first.md`) và ma trận phân quyền theo role **chưa được chốt** — chỉ mới xác nhận "có auth", chưa xác nhận độ chi tiết RBAC. Cần quyết định riêng trước khi implement Admin/CMS authorization guard chi tiết.

## Nguyên tắc bảo mật đã chốt [Đã chốt — Assumption #2: form OWASP-safe từ đầu]

Áp dụng cho cả `storefront`, `admin`, `cms`, bất kể đang ở giai đoạn mock-first:

- Không lưu access token dài hạn trong `localStorage`.
- Route account (storefront) / route quản trị (admin, cms) phải có authorization guard ở tầng route, không chỉ ẩn UI.
- Dữ liệu nhạy cảm (email, địa chỉ, số điện thoại) không gửi vào analytics.
- Form nhập liệu (login, register, checkout contact) dùng React Hook Form + Zod, validate cả client lẫn edge (khi có backend thật) — không tin dữ liệu client là đã sạch.

## Cơ chế auth [Đã chốt — Decision #22, xem ADR 0004]

Session cookie `httpOnly` tự quản lý (không NextAuth/Auth.js, không provider hosted) — lý do và các phương án đã cân nhắc ở [ADR 0004](../../adr/0004-authentication-mechanism.md).

## Chiến lược mock cho giai đoạn chưa có backend thật [Đề xuất]

Vì chưa có server thật để set HTTP-only cookie, đề xuất: **thiết kế contract y như sẽ có httpOnly cookie thật** (MSW handler mô phỏng set-cookie qua `Set-Cookie` trong response, session được middleware đọc lại) — dù bản chất vẫn chạy trong trình duyệt của dev. Mục đích: khi thay MSW bằng API thật, `packages/api-sdk` và `hooks/use-auth` không cần viết lại logic, chỉ đổi handler.

**Rủi ro chưa validate** (xem ADR 0004): MSW chế độ browser (service worker) và Next.js middleware (edge/server runtime) là hai ngữ cảnh khác nhau — cookie set qua response bị service-worker intercept không chắc chắn được middleware server-side đọc lại đúng như kỳ vọng. **Cần spike xác nhận cơ chế này trước khi build `use-auth` thật ở Phase 5**; nếu không hoạt động, phương án dự phòng là chạy MSW ở chế độ Node.js server (`setupServer`) riêng cho luồng auth thay vì service worker trình duyệt.

Với phạm vi đã chốt (Decision #20), `use-auth` nên được build khi bắt đầu Phase 5 (Storefront Features) — không cần trì hoãn thêm, nhưng cũng không nên dựng trước ở Phase 0–4 khi chưa có feature nào tiêu thụ nó (vẫn nhất quán YAGNI, Decision #10).
