---
status: done
blocked-by: [11-runner-workflow, 12-documentation-ownership]
kind: docs
labels: [wayfinder:task]
---

Part of 07-workflow-structure-map

# Cần cổng kiểm tra nào để docs không lệch code và workflow lần nữa?

Type: task

## Question

Sau khi chốt owner tài liệu và schema tracker/runtime, check nào bảo vệ Markdown, links/anchors, literal path consumer trong skill/prompt/comment và task references mà không phụ thuộc backend/network? Chốt vị trí CI/hook/verify-gates, phạm vi file maintained, cách xử lý link liên repo/ví dụ/lịch sử và regression tests cho check. Không ghi kiểm tra đã enforce nếu chưa có job thực thi.

## Context

[Kế hoạch hoàn thiện repo và docs](../12-documentation-ownership/plan.md).

## Implementation authorization

Ngày 18/11/2026: chủ repo yêu cầu thực hiện toàn bộ kế hoạch documentation ownership bằng implement-spec. Các phần triển khai theo graph chạy tuần tự trong checkout hiện tại; resolution Wayfinder phân biệt với merge delivery PR.
