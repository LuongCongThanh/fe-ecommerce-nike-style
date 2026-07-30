# FE Docs

Đây là thư mục tài liệu riêng cho Frontend của website bán hàng này.

Nếu bạn chỉ làm FE, hãy bắt đầu ở đây thay vì đọc toàn bộ `docs/`.

## Nên đọc theo thứ tự nào

1. [`FE.md`](./FE.md)
2. [`FE-ARCHITECTURE.md`](./FE-ARCHITECTURE.md)
3. [`FE-EXECUTION.md`](./FE-EXECUTION.md)

## Vai trò từng file

- [`FE.md`](./FE.md)
  Tài liệu FE tổng thể: mục tiêu, trạng thái quyết định, stack đã chốt, monorepo layout tổng quan, i18n, auth, performance baseline, và delivery order.

- [`FE-ARCHITECTURE.md`](./FE-ARCHITECTURE.md)
  Tài liệu chốt riêng cho kiến trúc Frontend: vai trò 3 app, module contract, import boundary, routing/layout/provider/auth architecture, và design system (token matrix, component inventory, state matrix, a11y baseline, icon/media rules).

- [`FE-EXECUTION.md`](./FE-EXECUTION.md)
  Foundation checklist, bootstrap steps, dependency matrix, và Definition of Done cho FE.

## Đường đọc theo mục đích

- Muốn hiểu FE tổng thể: `FE.md`
- Muốn chốt kiến trúc chuẩn cho 3 app và module chung, hoặc chuẩn design system để build component nhất quán: `FE-ARCHITECTURE.md`
- Muốn biết foundation gồm gì, khi nào pass, bắt đầu scaffold ngay, hoặc xem version/package matrix: `FE-EXECUTION.md`

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
7. [`FE-EXECUTION.md`](./FE-EXECUTION.md)

## Trạng thái hiện tại

Tính đến Thứ Tư, ngày 29 tháng 7 năm 2026:

- bộ tài liệu FE đã được chốt đủ để scaffold và build FE foundation
- repo vẫn chưa có code scaffold thật cho `apps/*` và `packages/*`
- vì vậy đây vẫn là execution docs cho giai đoạn bắt đầu code, chưa phải mô tả của codebase đã tồn tại
