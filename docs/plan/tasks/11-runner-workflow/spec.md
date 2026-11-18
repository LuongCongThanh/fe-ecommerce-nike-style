---
status: todo
blocked-by: []
kind: docs
labels: [wayfinder:task]
---

Part of 07-workflow-structure-map

# Workflow runner, task tracker và CI đã nhất quán khi tiếp tục công việc chưa?

Type: task

## Question

Đối chiếu task discovery, trạng thái, blocker, resume, provider preflight và gates với docs/plan/README.md và AGENT-SYSTEM-PLAN.md. Quyết định có cần ngăn runner nhận Wayfinder ticket khi ai đó đổi ready-for-agent: readTasks hiện đọc toàn bộ task folder mà không lọc nhãn. Rà cách CI kiểm tra docs/rules và E2E theo khả năng chạy độc lập, không chỉ thêm job có tên.

## Bằng chứng từ rà source

ESLint boundaries còn phân loại app route group, shared và auth/session; chưa phân loại mọi module trong src/features. Khi chọn gate kiến trúc, cần quyết định cách bảo vệ shared/API khỏi phụ thuộc feature và giữ danh sách seam cross-feature có chủ ý. Không đồng nhất lint xanh với boundary được enforce đầy đủ.
