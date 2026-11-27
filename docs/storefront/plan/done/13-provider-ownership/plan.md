# Plan: Provider cấp app nên được mount ở layout nào?

## Phạm vi

Giữ AppProviders tại root layout để phủ cả locale routes và offline; gỡ mount tại locale layout, giữ NextIntlClientProvider và setRequestLocale. Middleware bỏ qua locale redirect riêng /~offline để fallback root truy cập được (E2E phát hiện 404 có từ trước). Không thay transport, query policy hoặc session store. Branch tích hợp: `fix/13-provider-ownership`, tạo từ `origin/dev` sau khi xác nhận cây source khớp branch đã merge. Làm tuần tự trong checkout hiện tại; không dùng worktree. Chưa commit/push.

## Seams kiểm thử

- Compose hai server layout: mỗi locale chỉ có một provider; offline vẫn có provider; locale không hợp lệ vẫn notFound.
- AppProviders thật với QueryClient và AuthRuntimeProvider: bootstrap một lần, cache giữ qua rerender, một toaster/progress; mock overlay/framework phụ trợ.
- Playwright: login vi/en và offline không có toaster trùng, locale hiển thị đúng.

## Các bước

1. Viết regression test composition, chạy đỏ trên layout mount trùng.
2. Gỡ provider ở locale layout, chạy test composition và provider lifecycle.
3. Kiểm tra E2E hẹp, lint/format/typecheck/test/build.
4. Ghi resolution và cập nhật map/index; giữ các task khác mở.

## Rủi ro

QueryClient giờ có cùng vòng đời root thay vì bị thay khi đổi locale. Query keys phải chứa locale khi response phụ thuộc locale; các hook hiện có được rà trước khi kết luận. Không xóa cache tài khoản hoặc đổi behavior logout trong task này.
