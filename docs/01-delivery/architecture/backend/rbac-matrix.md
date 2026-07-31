# RBAC Matrix — admin/cms

> Kết quả phiên `grilling` + `domain-modeling` cho mô hình authorization `admin`/`cms`. Mô hình (permission-based guard, fail-closed, `Staff`/`Customer` tách biệt...) đã chốt ở [`ADR 0013`](../../../00-core/adr/0013-permission-based-authorization-admin-cms.md) và Decision `#78`/`#79` (`decision-log.md`). File này chỉ ghi **nội dung cụ thể** của role/permission — không lặp lại lý do mô hình, xem ADR để biết vì sao chọn cách này.

## Phạm vi

- Chỉ áp dụng cho `Staff` (`admin`/`cms`). `Customer` (storefront) không có `Role`/`Permission` — xem `glossary.md` mục "Identity & Access".
- Đây là baseline **MVP**, dựng từ đúng phạm vi hiện có ở `functional-requirements.md` §3.2 (`AD-01`–`AD-06`) và §3.3 (`CMS-01`–`CMS-08`). Không suy diễn thêm role/permission cho tính năng chưa có yêu cầu (ví dụ marketing, analytics).
- Mở rộng role/permission sau MVP đi theo "Mở rộng RBAC vượt baseline tối thiểu" ở `open-decisions.md`.

## Permission

Đặt tên theo `resource:action`. Action là CRUD (`create`/`read`/`update`/`delete`) khi resource có vòng đời tạo/xoá thật; chỉ `read`/`update` khi không có khái niệm tạo/xoá riêng; cộng thêm action nghiệp vụ khi CRUD không diễn đạt đủ.

| Permission | Nguồn | Ghi chú |
|---|---|---|
| `catalog:create`, `catalog:read`, `catalog:update`, `catalog:delete` | `AD-01` | Product/Variant/SKU |
| `category:create`, `category:read`, `category:update`, `category:delete` | `AD-02` | |
| `inventory:read`, `inventory:update` | `AD-03` | Tồn kho gắn theo SKU đã tồn tại — không có "tạo"/"xoá" tồn kho riêng |
| `order:read`, `order:update` | `AD-04` | Order do Customer tạo lúc checkout; Admin chỉ đọc và đổi trạng thái, không create/delete Order |
| `order:approve-return` | Return approval (`glossary.md`) | Tách riêng khỏi `order:update` vì có side-effect riêng (giải phóng tồn kho SKU) |
| `content:create`, `content:read`, `content:update`, `content:delete` | `CMS-01`–`CMS-08` | Bao gồm cả 7 content type và SEO Metadata — không tách resource riêng cho SEO Metadata |
| `content:publish`, `content:unpublish` | `CMS-01`–`CMS-08`, `security-baseline.md` §5 | `publish`: draft → published. `unpublish`: published → draft. Không có action "revert to draft" riêng — `unpublish` đã là hành động đó |
| `staff:create`, `staff:read`, `staff:update`, `staff:delete` | Quản lý `Staff` | |
| `staff:assign-role` | Gán/thu hồi `Role` cho `Staff` | Tách riêng khỏi `staff:update` vì đây là hành động cấp quyền, nhạy cảm hơn sửa profile |

## Role

| Role | Mô tả | Permission |
|---|---|---|
| `SUPER_ADMIN` | Toàn quyền, bao gồm tạo `Staff` và gán `Role` — bắt buộc phải có ít nhất role này để bootstrap các `Staff` khác | Tất cả permission ở trên |
| `ADMIN_STAFF` | Vận hành `admin`: catalog, category, tồn kho, đơn hàng. Không quản lý `Staff`/`Role` | `catalog:*`, `category:*`, `inventory:read`, `inventory:update`, `order:read`, `order:update`, `order:approve-return` |
| `CMS_EDITOR` | Biên tập nội dung CMS, tự publish không cần ai duyệt (không có yêu cầu review workflow ở MVP) | `content:*` (bao gồm `content:publish`, `content:unpublish`) |

`Staff` có thể được gán **nhiều** Role đồng thời (many-to-many); permission hiệu lực là hợp (union) permission của tất cả Role đang gán — xem `glossary.md` mục `Role`.

`Catalog Manager`, `Order Operator`, `Marketing Manager`, `Read-only Analyst` (danh sách 6 role tham khảo cũ từ `implementation-plan.md`, xem `functional-requirements.md` §3.2) **không** đưa vào baseline MVP: `Catalog Manager`/`Order Operator` gộp vào `ADMIN_STAFF` vì MVP không có yêu cầu tách trách nhiệm catalog/order thành hai người khác nhau; `Marketing Manager`/`Read-only Analyst` bỏ hẳn vì không có `AD-*`/`CMS-*` nào cần.

## Enforcement

- Controller khai báo bằng `RequirePermissions(...)`; nhiều permission trong một khai báo là **AND**.
- `PermissionsGuard` toàn cục, **fail-closed**: thiếu `RequirePermissions` bị từ chối, không mặc định cho qua. Route công khai thật khai báo bằng `@Public()`.
- Không có role bypass-all ngầm định trong guard — `SUPER_ADMIN` chỉ là role liệt kê đủ permission, không phải nhánh code riêng.
- JWT chỉ mang identity/session và `Role`; permission resolve runtime, trả riêng cho FE qua endpoint dạng `/staff/me` để phục vụ hiển thị UI — route guard FE chỉ là UX layer (ARC-007, `FE-ARCHITECTURE.md`).

## Quan hệ với các tài liệu khác

- Mô hình và lý do chọn: [`ADR 0013`](../../../00-core/adr/0013-permission-based-authorization-admin-cms.md), Decision `#78`/`#79` (`decision-log.md`).
- Domain term: `glossary.md` mục "Identity & Access" (`Customer`, `Staff`, `Role`, `Permission`, `PermissionsGuard`).
- Security baseline: [`../../security/security-baseline.md`](../../security/security-baseline.md) §4.
- Backend rollout: [`./roadmap.md`](./roadmap.md) Phase 7.
