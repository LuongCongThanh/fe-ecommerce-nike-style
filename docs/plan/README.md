# Chỉ mục kế hoạch và task

Task nằm tại `docs/plan/tasks/<NN>-<name>/spec.md`; giữ nguyên identity và tên spec/plan/report/metric/handoff vì runner, blocker, marker và resume phụ thuộc chúng. Runtime đọc frontmatter spec, không đọc bảng dưới. Không đổi delivery status chỉ vì có report.

- [Tracker](../agents/issue-tracker.md): schema, lifecycle, Wayfinder và report/metric format.
- [Runner](../agents/runner.md): chạy, preflight, resume, stop và giới hạn thực thi.
- [Roadmap](../roadmap.md): current backlog và dependency sản phẩm.
- [Plan docs rebuild](tasks/12-documentation-ownership/plan.md): phạm vi được duyệt.

Bảng giữ trạng thái điều hướng hiện có; đối chiếu spec/PR trước khi cập nhật. Không reconcile merge status trong đợt docs.

## Bảng task

| #   | Task                                                                    | Status          | Blocked by | PR  |
| --- | ----------------------------------------------------------------------- | --------------- | ---------- | --- |
| 01  | [category-breadcrumb-trail](tasks/01-category-breadcrumb-trail/spec.md) | ready-for-agent | -          |     |
| 02  | [order-date-locale](tasks/02-order-date-locale/spec.md)                 | ready-for-agent | -          |     |
| 03  | [pagination-window](tasks/03-pagination-window/spec.md)                 | ready-for-agent | -          |     |
| 04  | [order-status-badge-i18n](tasks/04-order-status-badge-i18n/spec.md)     | ready-for-agent | -          |     |
| 05  | [remove-dead-app-config](tasks/05-remove-dead-app-config/spec.md)       | ready-for-agent | -          |     |
| 06  | [order-return-lifecycle](tasks/06-order-return-lifecycle/spec.md)       | todo            | -          |     |
| 22  | [env-contract](tasks/22-env-contract/spec.md)                           | todo            | -          |     |
| 23  | [remove-sentry](tasks/23-remove-sentry/spec.md)                         | todo            | -          |     |
| 24  | [remove-tailwind-config](tasks/24-remove-tailwind-config/spec.md)       | todo            | -          |     |
| 25  | [git-hook-scope](tasks/25-git-hook-scope/spec.md)                       | todo            | -          |     |
| 26  | [pin-node-version](tasks/26-pin-node-version/spec.md)                   | todo            | -          |     |
| 27  | [eslint-single-config](tasks/27-eslint-single-config/spec.md)           | todo            | -          |     |
| 28  | [next-config-hardening](tasks/28-next-config-hardening/spec.md)         | todo            | 22         |     |
| 29  | [pnpm-settings-and-pinning](tasks/29-pnpm-settings-and-pinning/spec.md) | todo            | -          |     |
| 30  | [format-scope](tasks/30-format-scope/spec.md)                           | todo            | -          |     |
| 31  | [skills-lock-integrity](tasks/31-skills-lock-integrity/spec.md)         | todo            | -          |     |
| 32  | [middleware-to-proxy](tasks/32-middleware-to-proxy/spec.md)             | todo            | -          |     |
| 33  | [remove-admin-route-guard](tasks/33-remove-admin-route-guard/spec.md)   | todo            | 32         |     |

## Wayfinder: bảo trì workflow và cấu trúc

Các hồ sơ Wayfinder dùng quy trình riêng tại [tracker](../agents/issue-tracker.md#wayfinding-operations); `done` là đã ghi resolution, không đồng nghĩa đã merge PR. Không đưa chúng vào hàng đợi triển khai của runner.

| Hồ sơ                                                                                                             | Loại | Trạng thái |
| ----------------------------------------------------------------------------------------------------------------- | ---- | ---------- |
| [Đồng bộ workflow, cấu trúc và tài liệu storefront](tasks/07-workflow-structure-map/spec.md)                      | Map  | done       |
| [Đồng bộ cấu trúc hiện tại và các gate kiểm tra](tasks/08-workflow-structure-cleanup/spec.md)                     | Task | done       |
| [Kiểm kê độ lệch convention sau khi tách repository](tasks/09-convention-audit/spec.md)                           | Task | done       |
| [Ranh giới feature và các lớp service có còn cần thiết?](tasks/10-source-boundaries/spec.md)                      | Task | done       |
| [Workflow runner, task tracker và CI đã nhất quán khi tiếp tục công việc chưa?](tasks/11-runner-workflow/spec.md) | Task | done       |
| [Tài liệu nào là nguồn chuẩn và phần nào có thể gộp hoặc xóa?](tasks/12-documentation-ownership/spec.md)          | Task | done       |
| [Provider cấp app nên được mount ở layout nào?](tasks/13-provider-ownership/spec.md)                              | Task | done       |
| [Mã và cấu hình legacy nào còn cản trở hoàn tất rebuild?](tasks/14-rebuild-source-audit/spec.md)                  | Task | done       |
| [Cần cổng kiểm tra nào để docs không lệch code và workflow lần nữa?](tasks/15-docs-quality-gate/spec.md)          | Task | done       |

Kế hoạch chi tiết: [Hoàn thiện repo và tổ chức lại tài liệu](tasks/12-documentation-ownership/plan.md). Trạng thái thực tế và blocked-by đọc từ spec; bảng chỉ dùng điều hướng. Xem report task12 để biết phạm vi tài liệu đã chuyển; rebuild source/runtime có ticket riêng.
