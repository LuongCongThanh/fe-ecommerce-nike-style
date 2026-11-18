# Provider cấp app: kết luận và kiểm tra

## Quyết định

AppProviders có một owner tại root layout. Không có provider nào trong bộ này cần next-intl context; locale layout chỉ giữ setRequestLocale, kiểm tra locale hợp lệ và NextIntlClientProvider. Root vẫn phủ fallback offline và not-found. QueryClient giữ vòng đời root, không tạo lại khi localized children đổi.

## Đã làm

- Gỡ mount AppProviders khỏi locale layout. Không thay cấu hình QueryClient, auth runtime, query keys hoặc store.
- Test compose hai server layout bắt lỗi provider trùng ở vi/en; kiểm tra root route và locale không hợp lệ.
- Test AppProviders dùng QueryClient/AuthRuntimeProvider thật: cache còn sau rerender, bootstrap một lần, adapter unregister khi unmount, một toaster và progress surface. Mock các tích hợp hiển thị phụ trợ.
- E2E Chromium đi qua login vi/en, kiểm tra html lang và một region Notifications; /~offline trả 200 tại URL root, hiện trang offline và một region Notifications.
- E2E phát hiện /~offline trước đó bị locale middleware chuyển tới trang 404. Thêm bypass đúng pathname này, giữ nguyên guard tài khoản/checkout/admin; thêm test xác nhận intl middleware không được gọi.

## Bằng chứng

Trước sửa: test composition thất bại ở cả vi và en (có 2 provider, mong đợi 1). Sau sửa và bỏ ca lặp: 5 test layout/provider đạt. Sau bổ sung offline guard: 11 test hẹp đạt. E2E offline thất bại 404 trước bypass, sau sửa cả hành trình Chromium đạt.

Lần E2E đầu thiếu Chromium đúng revision; đã cài qua Playwright. Hai lần chỉnh locator dùng placeholder Email thực tế và region Notifications luôn tồn tại thay vì danh sách toast chỉ render khi có toast. Không đổi UI đăng nhập để làm test xanh.

## Giới hạn

Chỉ chạy E2E Chromium; không xác minh Firefox/WebKit, checkout thật, refresh token thật hoặc offline network/cache worker end-to-end. E2E offline kiểm tra route fallback khi online. Unit test cache kiểm tra rerender localized children, không mô phỏng mọi cơ chế điều hướng Next.js. API hiện không gửi locale qua transport nên giữ cache qua locale không đổi contract hiện tại; nếu API phân biệt ngôn ngữ, phải đưa locale vào query key ở lần cutover.

Việc xoá cache khi chuyển tài khoản là phạm vi session/cutover riêng; task này không thay policy đó. Không commit, push hoặc PR trong phiên này. Giữ nguyên glossary, spec trả hàng và hàng task 06 đang có ở local.

## Gate bản cuối

- pnpm lint: đạt.
- pnpm format:check: đạt.
- pnpm typecheck: đạt.
- pnpm test: 78 file, 1050 test đạt sau khi dọn test trùng.
- pnpm build với URL local và mock tắt: đạt.
- Playwright Chromium: 1 hành trình login vi/en và offline đạt.
- Prettier tài liệu, kiểm tra liên kết file và git diff --check: đạt.

## Hoàn tất theo implement-spec

Tiếp tục từ diff đã có, không triển khai lại hoặc nhận thêm ticket khác. Branch tích hợp `fix/13-provider-ownership` được tạo từ `origin/dev`; cây source tại mốc đó khớp PR đã merge. Theo AGENTS.md, thực hiện tuần tự trong checkout hiện tại thay vì tạo worktree.

Review độc lập theo Standards và Spec không phát hiện lỗi cần chặn. Dọn một test offline và một assertion locale bị lặp. Không đổi implementation sau các gate runtime đã ghi phía trên.

Chưa chạy toàn bộ browser suite: backend thật tại 127.0.0.1:8080 không hoạt động (connection refused khi kiểm tra), trong khi catalog E2E cần API này. E2E Chromium hẹp là phạm vi đã thực sự kiểm tra, không đại diện checkout hoặc offline network thật. Không có draft PR mới; local Wayfinder ticket đã có resolution. Chưa commit hoặc push phần thay đổi này.

Kiểm tra lại trong phiên implement-spec: toàn bộ 78 file / 1050 test đạt; test hẹp 3 file / 11 test đạt. Các gate runtime trước đó vẫn áp dụng vì chỉ xóa test và assertion lặp, không đổi mã chạy.
