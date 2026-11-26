# Chỉ mục kế hoạch và task

## Wayfinder: tái cấu trúc Storefront theo thiết kế đã duyệt

Map hoàn tất quyết định ngày 25/11/2026. [Backlog bàn giao đã chốt](tasks/21-storefront-delivery-breakdown/delivery.md) gồm mười một đợt chuẩn bị/migration và bốn đợt SSR; [Delivery specs và handoff](tasks/21-storefront-delivery-breakdown/handoff.md) đã được ghi ở todo; source chưa triển khai.

Đây là các hồ sơ quyết định, không thuộc hàng đợi delivery. `todo` là chưa resolve, `done` trong nhóm này là đã ghi quyết định, không phải source đã merge. Claim/blocker theo [tracker](../agents/issue-tracker.md#wayfinding-operations).

| Hồ sơ                                                                                                                                     | Loại     | Trạng thái | Blocked by                             |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------- |
| [Lập đường chuyển Storefront sang module nghiệp vụ và tên dễ hiểu](tasks/16-storefront-refactor-map/spec.md)                              | Map      | done       | —                                      |
| [Mỗi file hiện tại sẽ chuyển về đâu và còn consumer nào cần giữ?](tasks/17-storefront-migration-inventory/spec.md)                        | Task     | done       | —                                      |
| [Module nào được dùng phần công khai nào của module khác?](tasks/18-storefront-module-boundaries/spec.md)                                 | Grilling | done       | Kiểm kê mapping và consumer            |
| [Di chuyển provider và SDK thế nào để giữ đúng session, cache và server/client?](tasks/19-storefront-runtime-boundaries/spec.md)          | Grilling | done       | Kiểm kê mapping và consumer            |
| [Cần giữ hoặc bổ sung bằng chứng nào để xác nhận refactor không đổi hành vi?](tasks/20-storefront-verification-policy/spec.md)            | Grilling | done       | Kiểm kê, public boundary và runtime    |
| [Chia các đợt triển khai và blocker thế nào để mỗi đợt có thể build và kiểm tra độc lập?](tasks/21-storefront-delivery-breakdown/spec.md) | Grilling | done       | Public boundary, runtime và kiểm chứng |

[Thiết kế đích và lộ trình cấu trúc Storefront](storefront-structure-migration.md): hướng kiến trúc đã duyệt, chưa triển khai; không phải task spec của runner. Quyết định nền nằm ở [ADR 0001](../adr/0001-domain-modules-and-readable-names.md).

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
| 22  | [env-contract](tasks/22-env-contract/spec.md)                           | ready-for-agent | -          |     |
| 23  | [remove-sentry](tasks/23-remove-sentry/spec.md)                         | todo            | -          |     |
| 24  | [remove-tailwind-config](tasks/24-remove-tailwind-config/spec.md)       | todo            | -          |     |
| 25  | [git-hook-scope](tasks/25-git-hook-scope/spec.md)                       | ready-for-agent | -          |     |
| 26  | [pin-node-version](tasks/26-pin-node-version/spec.md)                   | ready-for-agent | -          |     |
| 27  | [eslint-single-config](tasks/27-eslint-single-config/spec.md)           | todo            | -          |     |
| 28  | [next-config-hardening](tasks/28-next-config-hardening/spec.md)         | ready-for-agent | 22         |     |
| 29  | [pnpm-settings-and-pinning](tasks/29-pnpm-settings-and-pinning/spec.md) | ready-for-agent | -          |     |
| 30  | [format-scope](tasks/30-format-scope/spec.md)                           | ready-for-agent | -          |     |
| 31  | [skills-lock-integrity](tasks/31-skills-lock-integrity/spec.md)         | todo            | -          |     |
| 32  | [middleware-to-proxy](tasks/32-middleware-to-proxy/spec.md)             | todo            | -          |     |
| 33  | [remove-admin-route-guard](tasks/33-remove-admin-route-guard/spec.md)   | todo            | 32         |     |

## Delivery: migration và SSR Storefront

Specs bàn giao từ [backlog đã chốt](tasks/21-storefront-delivery-breakdown/delivery.md). [Handoff và phạm vi giao nhau](tasks/21-storefront-delivery-breakdown/handoff.md). Tất cả task mới ở todo; chỉ người dùng triage ready-for-agent.

| Task                                                                                                          | Status          | Blocked by                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Nền kiểm chứng và baseline có thể tái lập](tasks/34-storefront-verification-foundation/spec.md)              | done            | [Chia đợt triển khai](tasks/21-storefront-delivery-breakdown/spec.md)                                                                                                                                                                                                                                           |
| [Rule và convention hỗ trợ migration có giới hạn](tasks/35-storefront-migration-rules/spec.md)                | done            | [Nền kiểm chứng và baseline có thể tái lập](tasks/34-storefront-verification-foundation/spec.md)                                                                                                                                                                                                                |
| [Shared components và cơ chế dùng chung](tasks/36-storefront-shared-migration/spec.md)                        | done            | [Rule và convention hỗ trợ migration có giới hạn](tasks/35-storefront-migration-rules/spec.md)                                                                                                                                                                                                                  |
| [Providers và layouts giữ lifecycle](tasks/37-storefront-providers-layouts/spec.md)                           | done            | [Shared components và cơ chế dùng chung](tasks/36-storefront-shared-migration/spec.md)                                                                                                                                                                                                                          |
| [Catalog thí điểm nguyên owner và wishlist composition](tasks/38-storefront-catalog-migration/spec.md)        | ready-for-agent | [Providers và layouts giữ lifecycle](tasks/37-storefront-providers-layouts/spec.md)                                                                                                                                                                                                                             |
| [Integration Backend và generated contract chuyển đồng lượt](tasks/39-storefront-backend-integration/spec.md) | ready-for-agent | [Catalog thí điểm nguyên owner và wishlist composition](tasks/38-storefront-catalog-migration/spec.md)                                                                                                                                                                                                          |
| [Auth và account theo public session boundary](tasks/40-storefront-auth-account-migration/spec.md)            | ready-for-agent | [Integration Backend và generated contract chuyển đồng lượt](tasks/39-storefront-backend-integration/spec.md)                                                                                                                                                                                                   |
| [Cart và wishlist giữ persistence và merge](tasks/41-storefront-cart-wishlist-migration/spec.md)              | ready-for-agent | [Integration Backend và generated contract chuyển đồng lượt](tasks/39-storefront-backend-integration/spec.md)                                                                                                                                                                                                   |
| [Orders và checkout giữ workflow và route contract](tasks/42-storefront-orders-checkout-migration/spec.md)    | ready-for-agent | [Cart và wishlist giữ persistence và merge](tasks/41-storefront-cart-wishlist-migration/spec.md)                                                                                                                                                                                                                |
| [Home và phần triển khai còn lại trong route](tasks/43-storefront-home-route-migration/spec.md)               | ready-for-agent | [Integration Backend và generated contract chuyển đồng lượt](tasks/39-storefront-backend-integration/spec.md)                                                                                                                                                                                                   |
| [Khóa migration và xóa ngoại lệ đã hết consumer](tasks/44-storefront-migration-cleanup/spec.md)               | ready-for-agent | [Auth và account theo public session boundary](tasks/40-storefront-auth-account-migration/spec.md), [Orders và checkout giữ workflow và route contract](tasks/42-storefront-orders-checkout-migration/spec.md), [Home và phần triển khai còn lại trong route](tasks/43-storefront-home-route-migration/spec.md) |
| [SSR public reader và danh sách sản phẩm thí điểm](tasks/45-storefront-ssr-products/spec.md)                  | ready-for-agent | [Khóa migration và xóa ngoại lệ đã hết consumer](tasks/44-storefront-migration-cleanup/spec.md)                                                                                                                                                                                                                 |
| [SSR category và search theo URL hiện có](tasks/46-storefront-ssr-category-search/spec.md)                    | ready-for-agent | [SSR public reader và danh sách sản phẩm thí điểm](tasks/45-storefront-ssr-products/spec.md)                                                                                                                                                                                                                    |
| [SSR product detail và related products](tasks/47-storefront-ssr-product-detail/spec.md)                      | ready-for-agent | [SSR public reader và danh sách sản phẩm thí điểm](tasks/45-storefront-ssr-products/spec.md)                                                                                                                                                                                                                    |
| [SSR phần catalog trên home và bàn giao trạng thái cuối](tasks/48-storefront-ssr-home/spec.md)                | ready-for-agent | [SSR public reader và danh sách sản phẩm thí điểm](tasks/45-storefront-ssr-products/spec.md)                                                                                                                                                                                                                    |

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
