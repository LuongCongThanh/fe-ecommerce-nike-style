---
status: todo
blocked-by: []
pr:
kind: logic
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes: true
---

# Spec 22: Hợp đồng biến môi trường khớp với code và kiểm tra khi khởi động

Branch: `fix/22-env-contract`

## Problem Statement

`.env.example`, schema `src/shared/lib/env.ts` và code thực tế mô tả ba bộ biến khác nhau:

- `src/shared/lib/env.ts` không được import ở đâu, nên không biến nào được kiểm tra. Comment "Required — app will fail to build/start without these" trong `.env.example` sai.
- Có hai biến cùng nghĩa "origin của Storefront": `NEXT_PUBLIC_SITE_URL` (root layout `metadataBase`, `API_BASE_URL`) và `NEXT_PUBLIC_APP_URL` (chỉ `src/shared/lib/seo.ts` và `src/features/checkout/constants/payment-config.ts` đọc, cả hai đều không có consumer production).
- `NEXT_PUBLIC_API_URL` không được code nào đọc ngoài schema chết.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` và `NEXT_PUBLIC_APP_NAME` được code đọc nhưng không có trong `.env.example`.
- Secret cổng thanh toán (VNPAY/MoMo/ZaloPay) nằm trong Storefront. Maintainer quyết định ngày 24/11/2026: ký giao dịch thuộc Backend, gỡ khỏi Storefront. `PAYMENT_CONFIG` và `PAYMENT_LABELS` không có consumer; các route webhook chúng trỏ tới không tồn tại.
- `next.config.ts` dùng `API_ORIGIN ?? 'http://localhost:8080'` cả khi build production, nên thiếu biến thì app vẫn build và proxy sai mà không báo lỗi.
- `docs/api-integration.md` ghi "NEXT_PUBLIC_APP_URL/NEXT_PUBLIC_API_URL còn được app/client sử dụng", không còn đúng.

## Solution

Một nguồn khai báo biến môi trường, khớp với những gì code đọc, được kiểm tra khi `next.config.ts` nạp (tức là khi chạy `next dev`, `next build` và `next start`).

- `NEXT_PUBLIC_SITE_URL` là origin Storefront duy nhất. `seo.ts` chuyển sang đọc nó; `NEXT_PUBLIC_APP_URL` và `NEXT_PUBLIC_API_URL` bị xoá khỏi schema, `.env.example`, CI và docs.
- Schema mô tả: `NEXT_PUBLIC_SITE_URL` (url, bắt buộc), `API_ORIGIN` (url, bắt buộc khi `NODE_ENV=production`, mặc định `http://localhost:8080` khi dev/test), `NEXT_PUBLIC_API_MOCKING` (`'true' | 'false'`, tùy chọn), `NEXT_PUBLIC_APP_NAME` và `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (tùy chọn), `NEXT_PUBLIC_CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` chỉ giữ nếu có code đọc (rà trước khi quyết; không có consumer thì xoá).
- `next.config.ts` gọi schema; lỗi in tên biến thiếu/sai và dừng.
- Xoá mọi biến thanh toán và file `src/features/checkout/constants/payment-config.ts`.

Cách nối schema với `next.config.ts` (import tương đối, file riêng ngoài `src/shared`, hay khác) do `plan.md` quyết, miễn là không đưa giá trị server-only vào client bundle.

## Phạm vi

Trong phạm vi: `.env.example`, `src/shared/lib/env.ts` (hoặc vị trí thay thế mà plan chọn), `next.config.ts`, `src/shared/lib/seo.ts` và `seo.test.ts`, `src/features/checkout/constants/payment-config.ts` (xoá), comment trong `src/shared/lib/mock-content.ts` nhắc `NEXT_PUBLIC_APP_URL`, `.github/workflows/ci.yml` (khối env của job build), `docs/api-integration.md`, `README.md` nếu câu về env cần sửa.

Ngoài phạm vi: `src/lib/api/env/config.ts` và nhánh `VITE_*` legacy (chỉ đọc giá trị đã được kiểm tra, không refactor), Sentry (task 23), security headers và `images.remotePatterns`, di chuyển file theo map tái cấu trúc Storefront.

[Manifest file/consumer và quyền thích ứng test trong scope](manifest.md) ghi snapshot hiện tại. Sau blocker, dùng đường dẫn đích đã chuyển thay vì tạo lại path cũ. Snapshot không thay thế việc kiểm tra diff, PR/resume work và config hiện hành trước plan.

## Acceptance criteria

- [ ] Trước khi sửa, ghi vào `report.md` kết quả `grep -rhoE "process\.env\.[A-Z_]+" src next.config.ts` và consumer của `PAYMENT_CONFIG`, `PAYMENT_LABELS`, `buildMetadata`. Nếu có consumer production mới xuất hiện, dừng và hỏi.
- [ ] Mỗi biến trong `.env.example` đều có code đọc; mỗi biến `NEXT_PUBLIC_*`/server mà code đọc (trừ `NODE_ENV`, `CI`, `ANALYZE`, `NEXT_RUNTIME`, `PLAYWRIGHT_BASE_URL`) đều có trong `.env.example` và schema.
- [ ] `grep -rnE "NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_API_URL|VNPAY|MOMO_|ZALOPAY" src .env.example .github docs README.md --exclude-dir=tasks` rỗng.
- [ ] `NODE_ENV=production` thiếu `API_ORIGIN` → `pnpm build` thất bại với thông báo nêu tên biến. Thiếu `NEXT_PUBLIC_SITE_URL` → tương tự. Ghi lệnh và output vào `report.md`.
- [ ] `pnpm dev` với `.env.example` copy nguyên sang `.env.local` vẫn chạy như trước.
- [ ] Không có giá trị server-only nào (`API_ORIGIN`, secret) xuất hiện trong `.next/static` sau build (`grep -r "localhost:8080" .next/static` rỗng khi build với giá trị đó).
- [ ] `seo.test.ts` stub `NEXT_PUBLIC_SITE_URL` thay cho `NEXT_PUBLIC_APP_URL`; không đổi assertion khác.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm docs:check`, `pnpm build` xanh.

## Ghi chú/rủi ro

- `.github/workflows/**` thuộc `denyPaths` của agent guard. Người cần cấp `approved.files: [.github/workflows/ci.yml]`, hoặc làm task trong phiên tương tác.
- `next.config.ts` là `askPaths`.
- Map tái cấu trúc Storefront (task 18) giữ `lib/env.ts` tại chỗ "nếu chưa có consumer". Task này tạo consumer, nên cần báo lại vị trí cuối của file trong `report.md` để inventory cập nhật.
- `allow-test-changes: true` chỉ để sửa stub env trong `seo.test.ts`.

## Comments
