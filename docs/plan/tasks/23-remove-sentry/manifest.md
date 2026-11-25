# Manifest phạm vi — Gỡ Sentry

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`src/shared/lib/monitoring/sentry.ts`, `src/app/[locale]/error.tsx`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.env.example`, schema env.

## Kiểm tra và giới hạn

Kiểm tra consumer `captureError`, dependency và allowBuilds; chỉ thay import boundary khi cần.

## Giao nhau và bàn giao

Đối chiếu task env và migration shared; lockfile sinh qua package manager. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
