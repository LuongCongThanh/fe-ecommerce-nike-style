# Manifest phạm vi — Gỡ Sentry

Snapshot tham chiếu ngày 25/11/2026. File dưới đây là source hiện tại để tìm owner/consumer; sau các blocker, dùng đường dẫn hiện hành thay vì path cũ. Đây không phải approved.files hay quyền sửa mọi file; spec là nguồn chuẩn về phạm vi và acceptance criteria. Refresh manifest khi lập plan; đổi path cơ học theo blocker không cần mở lại thiết kế. Consumer mới/khác semantics ngoài scope cần làm rõ trước khi sửa.

## Source owner hiện tại

- `src/shared/lib/monitoring/sentry.ts`

## Consumer trực tiếp hiện tại ngoài owner

- `src/app/[locale]/error.tsx` (import `captureError` duy nhất)

## Config/docs cần đối chiếu

- `package.json` và `pnpm-lock.yaml` (chỉ qua `pnpm remove @sentry/nextjs`)
- `pnpm-workspace.yaml` (`'@sentry/cli'` trong `allowBuilds`)
- `.env.example` và `src/shared/lib/env.ts` (`NEXT_PUBLIC_SENTRY_DSN`, nếu task 22 chưa xoá)

## Test cũ được thích ứng trong scope

- Không có. `allow-test-changes: false`; test hiện có chỉ chạy để kiểm, không sửa.

## Lệch với spec cần chốt trước plan

- Spec ghi repo không có `instrumentation.ts`, nhưng `src/instrumentation.ts` và `src/instrumentation.node.ts` có tồn tại. Hai file chỉ bật MSW phía server, không gọi Sentry, nên không đổi phạm vi; ghi nhận xét này vào `report.md`.

## Giao nhau với task khác

- Task 22: cùng `.env.example` và schema env; nếu 22 đã xoá `NEXT_PUBLIC_SENTRY_DSN` thì bỏ qua bước đó.
- Task 26, 27, 29: cùng sửa `package.json`; 27 và 29 cũng đổi `pnpm-lock.yaml`. Task merge sau rebase và sinh lại lockfile bằng package manager, không sửa tay.
- Task 29: chỉ đụng `allowBuilds` khi 23 đã gỡ `@sentry/cli`.
