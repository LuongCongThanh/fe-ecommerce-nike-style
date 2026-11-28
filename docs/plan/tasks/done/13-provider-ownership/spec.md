---
status: done
blocked-by: []
kind: docs
labels: [wayfinder:task]
assignee: maintainer-session
---

Part of 07-workflow-structure-map

# Provider cấp app nên được mount ở layout nào?

Type: task

## Question

Root layout và locale layout hiện cùng mount Providers từ app/_composition/AppProviders.tsx. Provider này tạo QueryClient, AuthRuntimeProvider, ThemeProvider, Toaster và progress bar. Cần giữ owner nào để tránh instance trùng mà vẫn đúng locale, offline route, session bootstrap và cache lifetime? Kiểm tra call tree và test hành vi trước khi gỡ một mount. Đợt chuyển file chỉ đổi vị trí, chưa đổi số lần mount.

## Comments

### 18/11/2026 — Resolution

Giữ AppProviders một lần tại root layout; locale layout chỉ sở hữu next-intl. Test hồi quy chứng minh trước sửa có hai provider ở vi/en, sau sửa chỉ còn một; QueryClient cache và auth runtime có vòng đời root. E2E phát hiện fallback /~offline bị locale middleware chuyển tới 404, đã thêm bypass riêng route này và test guard. Bản cuối đạt lint, format, typecheck, 1050 test (sau khi gỡ ca kiểm thử lặp), production build và một hành trình E2E Chromium. [Bằng chứng và giới hạn](report.md).

### 18/11/2026 — Hoàn tất theo implement-spec

Tiếp tục từ triển khai sẵn có trên branch `fix/13-provider-ownership` từ `origin/dev`. Review Standards/Spec không có phát hiện cần chặn; đã dọn một ca test offline và assertion lặp. Kiểm tra lại: 78 file / 1050 test, lint và format hẹp đạt. [Báo cáo](report.md) ghi giới hạn E2E và backend chưa chạy. Chưa commit/push.
