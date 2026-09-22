---
paths:
  - 'apps/admin/**'
  - 'apps/cms/**'
---

# Quy tắc Admin và CMS

- Hai app này dùng Vite và TanStack Router, không dùng API của Next.js.
- Giữ nguyên base path `/admin`, `/cms` và contract với microfrontend proxy của Storefront.
- Dùng react-i18next cho UI string. UI vận hành mặc định dùng tiếng Việt.
- Session của Staff trong Admin tuân theo contract adapter có hình dạng Better Auth trong shared code; không để feature phụ thuộc trực tiếp vào mock storage.
- Kiểm tra capability của Staff bằng permission, không hard-code theo tên role.
- Nêu rõ giả định xác thực của CMS; không sao chép cơ chế bảo vệ của Admin sang CMS khi chưa có yêu cầu.
- Chỉnh source route và để plugin TanStack Router sinh lại `routeTree.gen.ts`.
