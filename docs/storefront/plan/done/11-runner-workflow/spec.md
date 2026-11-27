---
status: done
blocked-by: []
kind: docs
labels: [wayfinder:task]
---

Part of 07-workflow-structure-map

# Workflow runner, task tracker và CI đã nhất quán khi tiếp tục công việc chưa?

Type: task

## Question

Đối chiếu task discovery, trạng thái, blocker, resume, provider preflight và gates với docs/storefront/plan/README.md và AGENT-SYSTEM-PLAN.md. Quyết định có cần ngăn runner nhận Wayfinder ticket khi ai đó đổi ready-for-agent: readTasks hiện đọc toàn bộ task folder mà không lọc nhãn. Rà cách CI kiểm tra docs/rules và E2E theo khả năng chạy độc lập, không chỉ thêm job có tên.

## Bằng chứng từ rà source

ESLint boundaries còn phân loại app route group, shared và auth/session; chưa phân loại mọi module trong src/features. Khi chọn gate kiến trúc, cần quyết định cách bảo vệ shared/API khỏi phụ thuộc feature và giữ danh sách seam cross-feature có chủ ý. Không đồng nhất lint xanh với boundary được enforce đầy đủ.

## Bằng chứng từ kiểm kê docs

- issue-tracker dùng approved:false như sign-off và ghi retro-turns do runner điền, trong khi parser dùng approved.files/commands và runtime nhận ngân sách retro bổ sung. Cần chốt schema canonical trước viết manual mới.
- uiCheck trong scripts/agent-run/implement-step.ts trả findings, cần điều tra trạng thái blocked và bằng chứng browser thay vì đồng nhất findings rỗng với check đã thực thi.
- Ba quyết định cuối AGENT-SYSTEM-PLAN gồm UI evidence, spec là nguồn status và PR khi retro hết lượt chưa đồng loạt được runtime thực thi. Khi viết docs phải tách current khỏi backlog; không loại bỏ các quyết định đã có vì rút gọn file.
- Runner đọc TASKS_DIR/spec làm dữ liệu, không đọc bảng index; Wayfinder label không tham gia lọc hiện tại.

Đích tài liệu mới và thứ tự cập nhật consumer: [kế hoạch ownership](../12-documentation-ownership/plan.md).

## Implementation authorization

Ngày 18/11/2026: chủ repo yêu cầu thực hiện toàn bộ kế hoạch documentation ownership bằng implement-spec. Các phần triển khai theo graph chạy tuần tự trong checkout hiện tại; resolution Wayfinder phân biệt với merge delivery PR.

## Resolution

18/11/2026 — Authorized local Wayfinder execution completed for runner selection/UI evidence and tracker/runtime truth. [Report](report.md) records 197 passing runner tests and limits. CI/docs gate work is tracked by task15; source audit by task14. This done is decision/implementation resolution, not a delivery PR merge. Ordinary delivery01–05 statuses remain unchanged.
