---
status: done
blocked-by: []
kind: docs
labels: [wayfinder:task]
assignee: maintainer-session
---

Part of 07-workflow-structure-map

# Đồng bộ cấu trúc hiện tại và các gate kiểm tra

Type: task

## Question

Cần cập nhật workflow và loại bỏ hướng dẫn cũ nào để tài liệu phản ánh đúng checkout mà không đổi hành vi storefront?

## Acceptance criteria

- CI có lint, format, OpenAPI, typecheck, unit test và build.
- Helper kiểm thử dùng chung nằm trong src/testing và consumer cập nhật đồng bộ.
- Cây cấu trúc phản ánh code hiện tại; tài liệu cũ được thay thế hoặc đánh dấu lịch sử.
- Ghi kết quả kiểm tra thực tế, không đổi trạng thái các task có sẵn.

## Comments

### 18/11/2026 — Resolution

Chủ repo đã chốt phạm vi workflow phát triển, GitHub Actions và triển khai cleanup trực tiếp. Source đã có features/shared nên chỉ chuyển helper render còn sót vào testing và cập nhật 7 consumer. Thay cây đề xuất 599 dòng bằng bản đồ cấu trúc hiện tại; bổ sung workflow phát triển và build CI với quyền contents:read, timeout và URL công khai cho build.

Xóa docs/plan/AGENT-INBOX.md sau khi hợp nhất thông tin còn hữu ích vào docs/README.md. Giữ ADR TailAdmin và đánh dấu lịch sử vì hồ sơ nguồn gốc vẫn có giá trị; bổ sung hiện trạng vào ADR single-repo. Đồng bộ hướng dẫn agent và local tracker. Không đổi hành vi sản phẩm hoặc trạng thái task có sẵn.

Kết quả và giới hạn: [Báo cáo kiểm tra](report.md).
