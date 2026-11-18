# Tài liệu storefront

| Cần làm gì                                     | Tài liệu                                                                                                                                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cài đặt, chạy và kiểm tra ứng dụng             | [README](../README.md), [CONTRIBUTING](../CONTRIBUTING.md)                                                                                                                   |
| Tìm quy ước code, vị trí module hoặc thuật ngữ | [AGENTS](../AGENTS.md), [quy ước](agents/code-conventions.md), [bản đồ thuật ngữ](plan/three-repo-restructure.md#glossary-map)                                               |
| Làm việc với ticket hoặc chạy agent            | [Vòng đời ticket và agent-run](plan/README.md), [hệ thống agent và 39 skill](plan/AGENT-SYSTEM-PLAN.md), [tracker](agents/issue-tracker.md)                                  |
| Tra cứu kế hoạch chuyển sang API thật          | [Kế hoạch storefront](plan/storefront-restructure-plan.md), [cấu trúc hiện tại](plan/storefront-target-module-tree.md), [kế hoạch liên repo](plan/three-repo-restructure.md) |
| Thiết kế hoặc review UI                        | [Design](../design.md), [phân tích Nike](nike-ui-ux-analysis.md), [skill UI](SKILL-USAGE-GUIDE.md)                                                                           |
| Sửa Hero/PDP dùng 3D                           | [Hướng dẫn kỹ thuật](FRONTEND-GUIDE.md#27-threejs-trong-storefront)                                                                                                          |

## Quyết định và tài liệu tham khảo

- [ADR](adr/) ghi lý do và bối cảnh của các quyết định kiến trúc.
- [Hồ sơ task](plan/README.md#bảng-task), [home motion](reference/home-motion/README.md) lưu kết quả và bài học triển khai.
- [Đề xuất kiến trúc ban đầu](reference/ideal.md) cung cấp bối cảnh cho các ADR đầu tiên.
- [Anthropic Academy](reference/anthropic-academy-research.md) lưu nghiên cứu và giới hạn xác minh tại thời điểm khảo sát.

## Workflow và bảo trì

- [Workflow phát triển và CI](../CONTRIBUTING.md#development-workflow).
- [Bản đồ đồng bộ workflow, cấu trúc và tài liệu](plan/tasks/07-workflow-structure-map/spec.md).
- Inbox runner đang hoạt động nằm ở `.agent-run/AGENT-INBOX.md` trong checkout cục bộ; không phải tài liệu được commit. Thí điểm ngày 16/11/2026 ghi nhận lỗi schema phản hồi, task chưa đủ điều kiện và hết ngân sách review; xem hồ sơ task để tra kết quả.
