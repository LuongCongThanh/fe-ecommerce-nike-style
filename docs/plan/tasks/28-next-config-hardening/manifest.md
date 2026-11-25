# Manifest phạm vi — Hardening Next config

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`next.config.ts`, `.env.example`, schema env sau task 22, `docs/architecture.md`, `docs/api-integration.md`, `e2e/home.spec.ts`, `e2e/catalog.spec.ts`.

## Kiểm tra và giới hạn

Rà host ảnh trong `src` và `e2e`; kiểm tra headers, service worker, image optimizer và browser theo spec.

## Giao nhau và bàn giao

Phụ thuộc task env; xác định path schema sau blocker, không đổi CSP hay proxy. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
