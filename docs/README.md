# FE — Chỉ mục tài liệu

Dự án e-commerce thời trang/giày thể thao (kiểu Nike), monorepo gồm Storefront, Admin, CMS. Đang ở giai đoạn brainstorming/thiết kế, chưa có backend thật (mock-first).

Đây là bản đồ toàn bộ `docs/` — dùng để biết nên đọc gì trước, và nguồn nào thắng khi hai tài liệu mâu thuẫn nhau.

## Thứ tự ưu tiên khi có mâu thuẫn

Từ cao xuống thấp — tài liệu đứng trên thắng nếu có sai khác:

1. **[`requirements/functional-requirements.md`](./requirements/functional-requirements.md)** — Yêu cầu chức năng gốc (functional requirements). Định nghĩa hệ thống phải làm gì cho MVP thật; mọi tài liệu khác không được mâu thuẫn với nó.
2. **[`glossary.md`](./glossary.md)** — Domain glossary (ubiquitous language). Định nghĩa thuật ngữ domain, dùng thống nhất khắp dự án.
3. **[`adr/`](./adr/)** — Architecture Decision Records cho các quyết định gây tranh cãi/có trade-off rõ, kèm alternatives đã cân nhắc.
4. **[`planning/decision-log.md`](./planning/decision-log.md)** — Nhật ký mọi quyết định đã chốt (#1–33), không riêng những cái đủ lớn để thành ADR.
5. **[`architecture/frontend/`](./architecture/frontend/README.md)** và **[`architecture/backend/`](./architecture/backend/README.md)** — Hình thức hoá các quyết định trên thành tài liệu kiến trúc triển khai được, kèm roadmap riêng cho từng phía. Không được mâu thuẫn với 4 nguồn trên. Backend hiện chỉ là khung sườn (chưa có code thật — xem `architecture/backend/README.md`).
6. **[`planning/brainstorm-session.md`](./planning/brainstorm-session.md)** — Bối cảnh/quá trình brainstorm (Understanding Summary, Assumptions, Open Questions) dẫn tới các quyết định. Nguồn ngữ cảnh, không phải nguồn quyết định.
7. **[`planning/reference/`](./planning/reference/README.md)** và **[`research/`](./research/)** — Tài liệu tham khảo thêm, **không phải quyết định**. Chỉ dùng làm gợi ý khi không mâu thuẫn với các nguồn trên.

## Cây thư mục

```
docs/
├── requirements/
│   └── functional-requirements.md        # yêu cầu chức năng gốc — nguồn sự thật cao nhất
├── glossary.md                          # nguồn sự thật domain (ubiquitous language)
├── adr/                                  # quyết định đã chốt, gây tranh cãi/trade-off rõ
│   ├── 0001-closed-locale-list.md
│   ├── 0002-locale-scope-storefront-only.md
│   ├── 0003-single-typography-token-set-across-locales.md
│   └── 0004-authentication-mechanism.md
├── architecture/
│   ├── frontend/                         # thiết kế solution chính thức, triển khai được + roadmap FE
│   └── backend/                          # khung sườn thiết kế backend (chưa có code) + roadmap BE
├── planning/
│   ├── decision-log.md                   # mọi quyết định đã chốt (#1–33)
│   ├── brainstorm-session.md             # bối cảnh, giả định, câu hỏi còn mở
│   └── reference/                        # KHÔNG phải quyết định — xem reference/README.md
│       ├── vision-sketch.md
│       ├── implementation-plan.md
│       └── solution-architect-workflow.md
└── research/
    └── nike-ui-ux-analysis.md            # tài liệu tham chiếu design system
```

## Trạng thái domain model

`glossary.md` hiện chỉ định nghĩa domain model cho **Locale/Market** (i18n). Domain model nghiệp vụ cốt lõi của một trang bán hàng — `Product`, `Variant`, `SKU`, `Cart`, `Order`, `Customer`... — **chưa được định nghĩa** ở đây; các nơi khác trong `docs/` (`implementation-plan.md`, `roadmap.md`) chỉ mượn tạm các khái niệm này làm tham khảo. Việc này được lên lịch chốt ở Phase 3 — Contract Foundation trong [`architecture/frontend/roadmap.md`](./architecture/frontend/roadmap.md), qua một phiên `grilling` + `domain-modeling` khác (tương tự phiên đã làm cho Locale, xem `brainstorm-session.md` §9).
