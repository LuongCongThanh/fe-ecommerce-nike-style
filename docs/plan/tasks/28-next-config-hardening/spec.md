---
status: todo
blocked-by:
  - 22-env-contract
pr:
kind: logic
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: false
---

# Spec 28: Security header cơ bản và thu hẹp host ảnh trong `next.config.ts`

Branch: `fix/28-next-config-hardening`

## Problem Statement

`next.config.ts` chỉ đặt header cho `/sw.js`; mọi trang khác không có `X-Content-Type-Options`, `Referrer-Policy`, chống nhúng iframe hay `Permissions-Policy`.

`images.remotePatterns` cho image optimizer lấy ảnh từ:

| Host                          | Ai dùng (24/11/2026)                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `**.amazonaws.com`            | Không có trong source; dự kiến là storage S3 của Backend khi deploy. Pattern hiện cho phép **mọi** bucket S3 |
| `http://localhost` (mọi port) | Backend dev dùng MinIO `localhost:9000`                                                                      |
| `i.pravatar.cc`               | `src/features/home/home-content.ts` (avatar testimonial)                                                     |
| `images.unsplash.com`         | Không có consumer                                                                                            |
| `placehold.co`                | `home-content.ts`, `src/lib/api/mocks/catalog-fixtures.ts`                                                   |
| `res.cloudinary.com`          | `src/shared/lib/cloudinary.ts`                                                                               |

Pattern rộng hoặc thừa cho phép người ngoài dùng `/_next/image` của Storefront để resize ảnh tuỳ ý, tốn tài nguyên. `localhost` dành cho dev nhưng có cả ở production.

## Solution

- Thêm header cho mọi route: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` tắt camera/microphone/geolocation. Thêm `Strict-Transport-Security` chỉ khi `NODE_ENV=production`.
- Bỏ `images.unsplash.com`.
- `http://localhost` chỉ có khi không phải production.
- Thay `**.amazonaws.com` bằng host lấy từ biến môi trường tùy chọn (ví dụ `IMAGE_STORAGE_HOST`) khai báo trong schema env của task 22. Không đặt biến thì không có pattern S3.
- Giữ `placehold.co`, `i.pravatar.cc`, `res.cloudinary.com` vì đang có consumer.

## Phạm vi

Trong phạm vi: `next.config.ts`, schema env và `.env.example` (thêm biến host storage), `docs/architecture.md` hoặc `docs/api-integration.md` nếu mô tả ảnh/host.

Ngoài phạm vi: Content-Security-Policy (cần nonce cho script inline của Next, MSW và three.js; để task riêng), đổi ảnh placeholder sang ảnh thật, `src/middleware.ts`.

## Acceptance criteria

- [ ] Trước khi sửa, ghi vào `report.md` kết quả `grep -rn` cho từng host trong `src e2e`. Nếu kết quả khác bảng trên, dừng và hỏi.
- [ ] `pnpm build && pnpm start`, rồi `curl -sI http://127.0.0.1:3000/vi` có đủ các header trên, kể cả HSTS. `pnpm dev` thì không có HSTS. Ghi output vào `report.md`.
- [ ] `/sw.js` vẫn trả `Cache-Control: no-cache, no-store, must-revalidate`.
- [ ] Khi build production, `/_next/image?url=http://localhost:9000/...` và `?url=https://images.unsplash.com/...` trả lỗi 400. Ảnh `placehold.co` trên trang chủ vẫn hiển thị.
- [ ] Playwright `e2e/home.spec.ts` và `e2e/catalog.spec.ts` xanh trên chromium.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm build` xanh.

## Ghi chú/rủi ro

- Blocked by task 22, vì biến host storage thuộc schema env task đó tạo.
- `next.config.ts` là `askPaths`.
- `X-Frame-Options: DENY` chặn mọi việc nhúng Storefront vào iframe. Hiện không có nhu cầu nhúng; nếu CMS cần preview qua iframe thì đổi sang `SAMEORIGIN` hoặc `frame-ancestors` trong task CSP.

## Comments

Tham khảo [manifest phạm vi](manifest.md); rà lại snapshot khi lập plan. Manifest không cấp quyền sửa file.
