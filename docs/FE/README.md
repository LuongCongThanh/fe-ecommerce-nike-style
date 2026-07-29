# FE Docs

Đây là thư mục tài liệu riêng cho Frontend của website bán hàng này.

Nếu bạn chỉ làm FE, hãy bắt đầu ở đây thay vì đọc toàn bộ `docs/`.

## Nên đọc theo thứ tự nào

1. [`FE.md`](./FE.md)
2. [`FE-ARCHITECTURE.md`](./FE-ARCHITECTURE.md)
3. [`FE-DESIGN-SYSTEM.md`](./FE-DESIGN-SYSTEM.md)
4. [`FE-FOUNDATION.md`](./FE-FOUNDATION.md)
5. [`FE-BOOTSTRAP-CHECKLIST.md`](./FE-BOOTSTRAP-CHECKLIST.md)
6. [`FE-VERSIONS.md`](./FE-VERSIONS.md)

## Vai trò từng file

- [`FE.md`](./FE.md)
  Tài liệu FE tổng thể: kiến trúc, stack, package responsibilities, setup baseline, và quyết định đã chốt.

- [`FE-ARCHITECTURE.md`](./FE-ARCHITECTURE.md)
  Tài liệu chốt riêng cho kiến trúc Frontend: vai trò 3 app, module contract, import boundary, routing/layout/provider/auth architecture.

- [`FE-DESIGN-SYSTEM.md`](./FE-DESIGN-SYSTEM.md)
  Tài liệu chốt riêng cho design system: token matrix, component inventory, state matrix, a11y baseline, icon/media rules.

- [`FE-FOUNDATION.md`](./FE-FOUNDATION.md)
  Tài liệu chốt riêng cho phần FE foundation: phạm vi foundation, package checklist, app shell checklist, Definition of Done.

- [`FE-BOOTSTRAP-CHECKLIST.md`](./FE-BOOTSTRAP-CHECKLIST.md)
  Runbook ngắn gọn để bắt đầu scaffold FE thật nhanh.

- [`FE-VERSIONS.md`](./FE-VERSIONS.md)
  Dependency matrix và upgrade policy cho FE.

## Đường đọc theo mục đích

- Muốn hiểu FE tổng thể: `FE.md`
- Muốn chốt kiến trúc chuẩn cho 3 app và module chung: `FE-ARCHITECTURE.md`
- Muốn chốt chuẩn design system để build component nhất quán: `FE-DESIGN-SYSTEM.md`
- Muốn biết foundation gồm gì và khi nào pass: `FE-FOUNDATION.md`
- Muốn bắt đầu scaffold ngay: `FE-BOOTSTRAP-CHECKLIST.md`
- Muốn xem version/package matrix: `FE-VERSIONS.md`

## Quan hệ với tài liệu ngoài thư mục này

- Scope hệ thống: [`../SRS.md`](../SRS.md)
- Test tổng thể: [`../TEST.md`](../TEST.md)
- Hỗ trợ, truy nguồn, và tài liệu cũ: [`../SUPPORTING-DOCS.md`](../SUPPORTING-DOCS.md)

## Thứ tự ưu tiên khi có mâu thuẫn

1. `../00-core/requirements/functional-requirements.md`
2. `../00-core/glossary.md`
3. `../00-core/adr/`
4. `../00-core/decision-log.md`
5. [`FE.md`](./FE.md)
6. [`FE-ARCHITECTURE.md`](./FE-ARCHITECTURE.md)
7. [`FE-DESIGN-SYSTEM.md`](./FE-DESIGN-SYSTEM.md)
8. [`FE-FOUNDATION.md`](./FE-FOUNDATION.md)
9. [`FE-BOOTSTRAP-CHECKLIST.md`](./FE-BOOTSTRAP-CHECKLIST.md)
10. [`FE-VERSIONS.md`](./FE-VERSIONS.md)

## Trạng thái hiện tại

Tính đến Thứ Tư, ngày 29 tháng 7 năm 2026:

- bộ tài liệu FE đã được chốt đủ để scaffold và build FE foundation
- repo vẫn chưa có code scaffold thật cho `apps/*` và `packages/*`
- vì vậy đây vẫn là execution docs cho giai đoạn bắt đầu code, chưa phải mô tả của codebase đã tồn tại
