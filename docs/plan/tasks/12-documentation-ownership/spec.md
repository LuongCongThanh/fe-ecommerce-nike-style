---
status: done
blocked-by: []
kind: docs
labels: [wayfinder:task]
assignee: maintainer-session
---

Part of 07-workflow-structure-map

# Tài liệu nào là nguồn chuẩn và phần nào có thể gộp hoặc xóa?

Type: task

## Question

Kiểm kê consumer của nike-ui-ux-analysis.md (1641 dòng), three-repo-restructure.md (956), SKILL-USAGE-GUIDE.md (356), AGENT-SYSTEM-PLAN.md (292) và research reference. Xác định phần quy tắc hiện hành, kế hoạch chưa thực hiện, lịch sử và tham khảo. Chốt một nơi giữ mỗi quy tắc; cập nhật link, skill và prompt trước khi xóa trùng. Tuổi tài liệu và số dòng không đủ chứng minh đã lỗi thời.

## Comments

### 18/11/2026 — Resolution

Đã kiểm kê 52 file docs (5.442 dòng tại baseline), nội dung lớn/trùng và consumer trong code, skill, role, runner. Chủ repo chọn hoàn thiện repo/workflow/docs trước; API cutover là lộ trình riêng. [Kế hoạch hoàn thiện repo và tổ chức tài liệu](plan.md) giữ toàn bộ owner table, cây đích, ma trận giữ/gộp/viết lại/xóa, thứ tự triển khai, cổng kiểm tra và điều kiện hoàn tất. Đây là kết luận lập kế hoạch, không khẳng định đã xóa hoặc viết lại docs vận hành. Map còn mở cho workflow, source legacy và quality gate.
