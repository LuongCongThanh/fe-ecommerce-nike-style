# Frontend Architecture — Chỉ mục tài liệu

> Đây là bản **thiết kế solution chính thức** cho phần Front-end của dự án FE (`E:\my-pj\FE`), tổng hợp và hình thức hoá các quyết định đã chốt trong [`decision-log.md`](../../planning/decision-log.md). Khác với brainstorm-session/decision-log (nhật ký quá trình và quyết định), các tài liệu trong `docs/architecture/frontend/` là **nguồn tham chiếu chính** cho việc triển khai từ nay trở đi.

## Quan hệ với các tài liệu khác

| Tài liệu | Vai trò | Có bị tài liệu này thay thế không? |
|---|---|---|
| [`decision-log.md`](../../planning/decision-log.md) | Nhật ký quyết định đã chốt (Decision #1–33) | Không — vẫn là nguồn sự thật cho *lý do* đằng sau mỗi quyết định. Tài liệu kiến trúc này **không được mâu thuẫn** với Decision Log; nếu có sai khác, Decision Log thắng. |
| [`brainstorm-session.md`](../../planning/brainstorm-session.md) | Bối cảnh & quá trình brainstorm (Understanding Summary, Assumptions, Open Questions) dẫn tới các quyết định trong Decision Log | Không — vẫn là nguồn ngữ cảnh cho *vì sao* buổi brainstorm đi tới hướng này. |
| [`glossary.md`](../../glossary.md) | Domain glossary (Locale, Market, Localized Text...) | Không — vẫn là nguồn sự thật cho định nghĩa domain. |
| [`docs/adr/`](../../adr/) | ADR cho các quyết định gây tranh cãi/có trade-off rõ | Không — tài liệu này link tới ADR thay vì lặp lại nội dung. |
| [`vision-sketch.md`](../../planning/reference/vision-sketch.md), [`nike-ui-ux-analysis.md`](../../research/nike-ui-ux-analysis.md), [`implementation-plan.md`](../../planning/reference/implementation-plan.md) | **Tham khảo thêm** (Decision #11) — xem [`planning/reference/README.md`](../../planning/reference/README.md) | Không áp dụng trực tiếp — chỉ được dùng làm gợi ý khi không mâu thuẫn với Decision Log. Mọi chỗ tài liệu này lấy ý tưởng từ 3 file trên đều được đánh dấu rõ "adopted from reference". |
| [`solution-architect-workflow.md`](../../planning/reference/solution-architect-workflow.md) | Khung quy trình Solution Architect tổng quát | Chỉ mục **Giai đoạn 2 — Front-end Architecture** của file này được dùng làm khung sườn cho bộ tài liệu hiện tại. |

## Quy ước đọc tài liệu

Mỗi tài liệu dưới đây, khi đưa ra một quyết định kiến trúc, đánh dấu rõ trạng thái:

- **[Đã chốt]** — đã có trong Decision Log hoặc ADR, tài liệu này chỉ hình thức hoá lại.
- **[Đề xuất]** — quyết định kiến trúc mới, chưa từng được thảo luận trong brainstorm, do tài liệu này đưa ra dựa trên các nguyên tắc đã chốt. Cần bạn xác nhận trước khi coi là chốt.
- **[Mở]** — câu hỏi còn để ngỏ trong brainstorm (Open Questions), tài liệu này trình bày các lựa chọn nhưng **không tự chọn thay bạn**.

## Chỉ mục tài liệu

1. [`frontend-overview.md`](./frontend-overview.md) — Business context, goals/non-goals, nguyên tắc chỉ đạo, bản đồ tài liệu.
2. [`module-architecture.md`](./module-architecture.md) — Cấu trúc monorepo, trách nhiệm từng package, quy tắc phụ thuộc.
3. [`routing.md`](./routing.md) — Route groups từng app, locale routing, URL-as-state.
4. [`design-system.md`](./design-system.md) — 3 tầng token, phân tầng component, hợp đồng Storybook.
5. [`i18n-locale.md`](./i18n-locale.md) — Kiến trúc hoá domain model Locale/Market, vị trí `SUPPORTED_LOCALES`, schema cho Localized Text.
6. [`state-management.md`](./state-management.md) — Ma trận sở hữu state (URL / server state / client state).
7. [`api-integration.md`](./api-integration.md) — Quan hệ `schemas` ↔ `api-sdk` ↔ MSW, error envelope, pagination contract.
8. [`authentication-authorization.md`](./authentication-authorization.md) — Phạm vi auth trong MVP (đã chốt), cơ chế đề xuất (xem [ADR 0004](../../adr/0004-authentication-mechanism.md)), nguyên tắc bảo mật đã chốt. **[Mở]**: ma trận RBAC/role cho `admin`/`cms`.
9. [`testing.md`](./testing.md) — Test pyramid, critical path cho MVP (COD-only).
10. [`performance-seo.md`](./performance-seo.md) — Mục tiêu Core Web Vitals, chiến lược SEO đa locale.
11. [`roadmap.md`](./roadmap.md) — Lộ trình theo phase (không mốc thời gian), tiêu chí hoàn thành từng phase.

## Phạm vi

Bộ tài liệu này **chỉ bao phủ Front-end** (3 app: `storefront`, `admin`, `cms` + `packages/` dùng chung). Backend, data architecture, cloud/infra là **non-goal ở giai đoạn này** (xem brainstorm-session.md §1) — không có tài liệu tương ứng, không nên tạo `docs/architecture/backend/` cho tới khi backend framework được chốt.
