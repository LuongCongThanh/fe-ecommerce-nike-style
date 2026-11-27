# Manifest phạm vi — Hợp đồng biến môi trường

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `.env.example`
- `src/shared/lib/env.ts` (hoặc vị trí thay thế mà plan chọn)
- `src/shared/lib/seo.ts`
- `next.config.ts` (`API_ORIGIN`)
- `src/features/checkout/constants/payment-config.ts` (xoá)

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/layout.tsx` (`metadataBase` đọc `NEXT_PUBLIC_SITE_URL`)
- `src/shared/lib/cloudinary.ts` (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`)
- `src/shared/lib/mock-content.ts` (comment nhắc `NEXT_PUBLIC_APP_URL`)

## Config/docs cần đối chiếu

- `.github/workflows/ci.yml` (khối env của job build)
- `docs/storefront/api-integration.md`
- `README.md` nếu câu về env cần sửa
- `docs/research/nextjs-naming-conventions.md` dòng 171 và 182 (nhắc và link tới `payment-config.ts`)
- `vitest.config.ts` dòng 39 (coverage `exclude`; chỉ sửa khi plan đổi vị trí `env.ts`)
- `src/lib/api/env/config.ts` chỉ đối chiếu (đọc `NEXT_PUBLIC_API_MOCKING`; ngoài phạm vi, không refactor)

## Test cũ được thích ứng trong scope

- `src/shared/lib/seo.test.ts`: chỉ đổi stub `NEXT_PUBLIC_APP_URL` sang `NEXT_PUBLIC_SITE_URL`

## Giao nhau với task khác

- Task 23: cùng sửa `.env.example` và schema env (`NEXT_PUBLIC_SENTRY_DSN`). Task merge sau thì rebase.
- Task 26: cùng sửa `.github/workflows/ci.yml`; 22 sửa khối env, 26 sửa `actions/setup-node`.
- Task 28: blocked by 22, thêm biến host storage vào schema env do 22 tạo.
