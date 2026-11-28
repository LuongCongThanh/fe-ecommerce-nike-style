# Chỉ mục kế hoạch và ticket

Thư mục `docs/plan/` lưu kế hoạch cấu trúc Storefront và hồ sơ ticket, được chia theo tình trạng thực hiện. Trạng thái chi tiết và dependency lấy từ `spec.md`; README này dùng để điều hướng.

## Cấu trúc thư mục

```text
docs/plan/
├── README.md
├── todo/       # Ticket chưa hoàn tất
├── done/       # Ticket hoàn tất và hồ sơ quyết định đã chốt
└── wontfix/    # Ticket đã quyết định không thực hiện
```

| Thư mục                   | Số ticket | Ý nghĩa                                                                 |
| ------------------------- | --------- | ----------------------------------------------------------------------- |
| [todo/](tasks/todo)       | 13        | Chưa hoàn tất, gồm 7 ticket `ready-for-agent` và 6 ticket `todo`.       |
| [done/](tasks/done)       | 35        | 20 ticket triển khai hoàn tất và 15 hồ sơ Wayfinder đã chốt quyết định. |
| [wontfix/](tasks/wontfix) | 0         | Chưa có ticket được quyết định bỏ.                                      |

[Kế hoạch cấu trúc Storefront](tasks/done/16-storefront-refactor-map/design.md) mô tả hướng kiến trúc và lộ trình đã duyệt; các đợt migration và SSR tương ứng đã hoàn tất tại ticket 34–48. Quyết định nền nằm ở [ADR 0001](../adr/0001-domain-modules-and-readable-names.md).

## todo — Chưa hoàn tất

Tên thư mục `todo/` bao gồm mọi ticket đang chờ hoặc đang thực hiện. Runner chỉ chọn ticket có `status: ready-for-agent`, không thuộc Wayfinder và có tất cả `blocked-by` đã `done`. Chỉ người dùng chuyển ticket từ `todo` sang `ready-for-agent`.

| #   | Ticket                                                                                                           | Trạng thái        | Phụ thuộc                                       |
| --- | ---------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------- |
| 04  | [Nhãn trạng thái đơn hàng theo i18n](tasks/todo/04-order-status-badge-i18n/spec.md)                              | `ready-for-agent` | —                                               |
| 06  | [Vòng đời trả hàng toàn đơn](tasks/todo/06-order-return-lifecycle/spec.md)                                       | `todo`            | —                                               |
| 22  | [Hợp đồng biến môi trường khớp với code và kiểm tra khi khởi động](tasks/todo/22-env-contract/spec.md)           | `ready-for-agent` | —                                               |
| 23  | [Gỡ Sentry chưa được cấu hình](tasks/todo/23-remove-sentry/spec.md)                                              | `todo`            | —                                               |
| 24  | [Xoá `tailwind.config.ts` không được Tailwind v4 đọc](tasks/todo/24-remove-tailwind-config/spec.md)              | `todo`            | —                                               |
| 25  | [Git hook nhẹ, để build cho CI](tasks/todo/25-git-hook-scope/spec.md)                                            | `ready-for-agent` | —                                               |
| 26  | [Pin phiên bản Node bằng `.nvmrc`](tasks/todo/26-pin-node-version/spec.md)                                       | `ready-for-agent` | —                                               |
| 27  | [Gộp ESLint về một file và bỏ rule chạy trùng](tasks/todo/27-eslint-single-config/spec.md)                       | `todo`            | —                                               |
| 28  | [Security header cơ bản và thu hẹp host ảnh trong `next.config.ts`](tasks/todo/28-next-config-hardening/spec.md) | `ready-for-agent` | [22](tasks/todo/22-env-contract/spec.md)        |
| 29  | [Cấu hình pnpm ở một chỗ và pin phiên bản dependency](tasks/todo/29-pnpm-settings-and-pinning/spec.md)           | `ready-for-agent` | —                                               |
| 30  | [Một phạm vi Prettier cho script, hook và CI](tasks/todo/30-format-scope/spec.md)                                | `ready-for-agent` | —                                               |
| 31  | [Ghi commit nguồn cho các skill bên ngoài trong `skills-lock.json`](tasks/todo/31-skills-lock-integrity/spec.md) | `todo`            | —                                               |
| 33  | [Gỡ nhánh chặn `/admin` khỏi proxy](tasks/todo/33-remove-admin-route-guard/spec.md)                              | `todo`            | [32](tasks/done/32-middleware-to-proxy/spec.md) |

## done — Đã hoàn tất

### Ticket triển khai

Các ticket dưới đây có trạng thái `done`. Với ticket triển khai, `done` nghĩa là PR đã merge. Giữ nguyên các artifact đi kèm để tra cứu phạm vi, kết quả và bằng chứng kiểm tra.

| #   | Ticket                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------ |
| 01  | [Breadcrumb danh mục theo chuỗi cha–con](tasks/done/01-category-breadcrumb-trail/spec.md)                          |
| 02  | [Định dạng ngày đơn hàng theo locale](tasks/done/02-order-date-locale/spec.md)                                     |
| 03  | [Phân trang rút gọn có dấu "..." và `aria-current`](tasks/done/03-pagination-window/spec.md)                       |
| 05  | [Xóa hằng số chết trong `app-config.ts`](tasks/done/05-remove-dead-app-config/spec.md)                             |
| 32  | [Đổi `middleware.ts` sang quy ước `proxy.ts` của Next 16](tasks/done/32-middleware-to-proxy/spec.md)               |
| 34  | [Nền kiểm chứng và baseline có thể tái lập](tasks/done/34-storefront-verification-foundation/spec.md)              |
| 35  | [Rule và convention hỗ trợ migration có giới hạn](tasks/done/35-storefront-migration-rules/spec.md)                |
| 36  | [Shared components và cơ chế dùng chung](tasks/done/36-storefront-shared-migration/spec.md)                        |
| 37  | [Providers và layouts giữ lifecycle](tasks/done/37-storefront-providers-layouts/spec.md)                           |
| 38  | [Catalog thí điểm nguyên owner và wishlist composition](tasks/done/38-storefront-catalog-migration/spec.md)        |
| 39  | [Integration Backend và generated contract chuyển đồng lượt](tasks/done/39-storefront-backend-integration/spec.md) |
| 40  | [Auth và account theo public session boundary](tasks/done/40-storefront-auth-account-migration/spec.md)            |
| 41  | [Cart và wishlist giữ persistence và merge](tasks/done/41-storefront-cart-wishlist-migration/spec.md)              |
| 42  | [Orders và checkout giữ workflow và route contract](tasks/done/42-storefront-orders-checkout-migration/spec.md)    |
| 43  | [Home và phần triển khai còn lại trong route](tasks/done/43-storefront-home-route-migration/spec.md)               |
| 44  | [Khóa migration và xóa ngoại lệ đã hết consumer](tasks/done/44-storefront-migration-cleanup/spec.md)               |
| 45  | [SSR public reader và danh sách sản phẩm thí điểm](tasks/done/45-storefront-ssr-products/spec.md)                  |
| 46  | [SSR category và search theo URL hiện có](tasks/done/46-storefront-ssr-category-search/spec.md)                    |
| 47  | [SSR product detail và related products](tasks/done/47-storefront-ssr-product-detail/spec.md)                      |
| 48  | [SSR phần catalog trên home và bàn giao trạng thái cuối](tasks/done/48-storefront-ssr-home/spec.md)                |

### Hồ sơ Wayfinder

Với Wayfinder, `done` nghĩa là đã ghi quyết định hoặc resolution; trạng thái này không tự khẳng định source đã triển khai. Các hồ sơ này không thuộc hàng đợi triển khai của runner.

| #   | Ticket                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 07  | [Đồng bộ workflow, cấu trúc và tài liệu storefront](tasks/done/07-workflow-structure-map/spec.md)                                              |
| 08  | [Đồng bộ cấu trúc hiện tại và các gate kiểm tra](tasks/done/08-workflow-structure-cleanup/spec.md)                                             |
| 09  | [Kiểm kê độ lệch convention sau khi tách repository](tasks/done/09-convention-audit/spec.md)                                                   |
| 10  | [Ranh giới feature và các lớp service có còn cần thiết?](tasks/done/10-source-boundaries/spec.md)                                              |
| 11  | [Workflow runner, task tracker và CI đã nhất quán khi tiếp tục công việc chưa?](tasks/done/11-runner-workflow/spec.md)                         |
| 12  | [Tài liệu nào là nguồn chuẩn và phần nào có thể gộp hoặc xóa?](tasks/done/12-documentation-ownership/spec.md)                                  |
| 13  | [Provider cấp app nên được mount ở layout nào?](tasks/done/13-provider-ownership/spec.md)                                                      |
| 14  | [Mã và cấu hình legacy nào còn cản trở hoàn tất rebuild?](tasks/done/14-rebuild-source-audit/spec.md)                                          |
| 15  | [Cần cổng kiểm tra nào để docs không lệch code và workflow lần nữa?](tasks/done/15-docs-quality-gate/spec.md)                                  |
| 16  | [Lập đường chuyển Storefront sang module nghiệp vụ và tên dễ hiểu](tasks/done/16-storefront-refactor-map/spec.md)                              |
| 17  | [Mỗi file hiện tại sẽ chuyển về đâu và còn consumer nào cần giữ?](tasks/done/17-storefront-migration-inventory/spec.md)                        |
| 18  | [Module nào được dùng phần công khai nào của module khác?](tasks/done/18-storefront-module-boundaries/spec.md)                                 |
| 19  | [Di chuyển provider và SDK thế nào để giữ đúng session, cache và server/client?](tasks/done/19-storefront-runtime-boundaries/spec.md)          |
| 20  | [Cần giữ hoặc bổ sung bằng chứng nào để xác nhận refactor không đổi hành vi?](tasks/done/20-storefront-verification-policy/spec.md)            |
| 21  | [Chia các đợt triển khai và blocker thế nào để mỗi đợt có thể build và kiểm tra độc lập?](tasks/done/21-storefront-delivery-breakdown/spec.md) |

Tài liệu bàn giao migration: [Backlog đã chốt](tasks/done/21-storefront-delivery-breakdown/delivery.md), [handoff](tasks/done/21-storefront-delivery-breakdown/handoff.md). Kế hoạch bảo trì tài liệu: [Plan ticket 12](tasks/done/12-documentation-ownership/plan.md).

## wontfix — Không thực hiện

Hiện chưa có ticket. Chỉ chuyển ticket vào đây khi đã ghi rõ quyết định không thực hiện và lý do trong hồ sơ; chưa làm rõ hoặc đang bị chặn vẫn thuộc `todo/`.

## Quy tắc cập nhật

- Ticket mới đặt tại `todo/<NN>-<name>/spec.md`, với trạng thái ban đầu là `todo`.
- Khi ticket hoàn tất hoặc được quyết định bỏ, chuyển toàn bộ thư mục sang `done/` hoặc `wontfix/` và cập nhật các liên kết cùng README này.
- Giữ nguyên tên thư mục ticket và các artifact `spec.md`, `plan.md`, `report.md`, `metric.md`, `handoff.md` nếu có. Không đổi trạng thái chỉ vì đã có report.
- `blocked-by` giữ tên thư mục ticket, không thêm `todo/`, `done/` hay `wontfix/`. Runner đọc cả ba nhóm để đối chiếu dependency, chỉ chọn ticket trong `todo/` để triển khai.
- Khi thay đổi trạng thái, cập nhật bảng và số lượng tương ứng trong README; schema và vòng đời chi tiết theo tracker.

Tài liệu vận hành: [Tracker](../agents/issue-tracker.md), [Runner](../agents/runner.md), [Roadmap](roadmap.md).
