---
status: done
blocked-by: []
kind: docs
labels: [wayfinder:task]
assignee: maintainer-session
---

Part of 07-workflow-structure-map

# Kiểm kê độ lệch convention sau khi tách repository

Type: task

## Question

Những hướng dẫn nào còn trỏ tới source monorepo đã xóa hoặc không còn được nạp cho source hiện tại, và baseline nào cần có trước khi chọn đợt refactor tiếp theo?

## Acceptance criteria

- Rà mọi file rule và phạm vi paths, alias, test placement, API và i18n.
- Sửa hướng dẫn chắc chắn lỗi thời, xóa rule Admin/CMS không thuộc storefront.
- Có kiểm kê source, workflow, tài liệu và các câu hỏi tiếp theo có bằng chứng.
- Kiểm tra đích file của liên kết tài liệu; ghi rõ giới hạn của scan.

## Comments

### 18/11/2026 — Resolution

Đã xác nhận độ lệch convention ở paths, alias, ownership, i18n và API contract; sửa các hướng dẫn lỗi thời và xóa rule Admin/CMS không còn áp dụng. [Kiểm kê và giới hạn](report.md) giữ bằng chứng. Các quyết định refactor source, runner và ownership tài liệu được tách thành ticket kế tiếp, không kết luận map đã xong.
