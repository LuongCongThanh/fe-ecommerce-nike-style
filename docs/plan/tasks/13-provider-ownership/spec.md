---
status: todo
blocked-by: []
kind: docs
labels: [wayfinder:task]
---

Part of 07-workflow-structure-map

# Provider cấp app nên được mount ở layout nào?

Type: task

## Question

Root layout và locale layout hiện cùng mount Providers từ app/_composition/AppProviders.tsx. Provider này tạo QueryClient, AuthRuntimeProvider, ThemeProvider, Toaster và progress bar. Cần giữ owner nào để tránh instance trùng mà vẫn đúng locale, offline route, session bootstrap và cache lifetime? Kiểm tra call tree và test hành vi trước khi gỡ một mount. Đợt chuyển file chỉ đổi vị trí, chưa đổi số lần mount.
