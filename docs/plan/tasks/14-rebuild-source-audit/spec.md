---
status: done
blocked-by: [12-documentation-ownership]
kind: docs
labels: [wayfinder:task]
---

Part of 07-workflow-structure-map

# Mã và cấu hình legacy nào còn cản trở hoàn tất rebuild?

Type: task

## Question

Sau khi tách source, những role admin, public scaffold asset, mock export quản trị, alias/dependency/config nào thực sự không có consumer và có thể xóa mà không đổi hành vi storefront? Kiểm kê cả import/export, URL động, convention Next.js, CSS, scripts/generator/hooks/test; xác định test và owner cho mỗi ứng viên. Dùng code hiện tại làm bằng chứng; giữ MSW cho luồng chưa cutover và không suy diễn unused từ một scan.

## Context

[Kế hoạch hoàn thiện repo và docs](../12-documentation-ownership/plan.md).

## Implementation authorization

Ngày 18/11/2026: chủ repo yêu cầu thực hiện toàn bộ kế hoạch documentation ownership bằng implement-spec. Các phần triển khai theo graph chạy tuần tự trong checkout hiện tại; resolution Wayfinder phân biệt với merge delivery PR.
