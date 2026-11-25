# Manifest phạm vi — Hợp đồng biến môi trường

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`.env.example`, `src/shared/lib/env.ts`, `next.config.ts`, `src/shared/lib/seo.ts`, `src/shared/lib/seo.test.ts`, `src/features/checkout/constants/payment-config.ts`, `src/shared/lib/mock-content.ts`, `.github/workflows/ci.yml`, `docs/api-integration.md`, `README.md`.

## Kiểm tra và giới hạn

Rà toàn bộ consumer env, `PAYMENT_CONFIG`, `PAYMENT_LABELS` và `buildMetadata` trước khi thay đổi; test được phép đổi stub env theo spec.

## Giao nhau và bàn giao

Giao nhau với gỡ Sentry và hardening Next; dùng schema thực tế sau các thay đổi đã hoàn thành. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
