# Frontend Overview

## Business context

Nền tảng e-commerce thời trang/giày thể thao kiểu Nike (**Brand Commerce**, không phải website bán hàng thông thường), là sản phẩm/kinh doanh thật, không phải bài tập học tập. Solo dev, không deadline cố định — ưu tiên chất lượng và nhịp độ bền vững hơn tốc độ ra hàng. (Nguồn: brainstorm-session.md §1, Decision #2, #9)

## Goals

- UI/UX, IA và performance ngang tầm Nike/Apple (LCP < 2.5s, CLS < 0.1, INP < 200ms, Lighthouse > 95 — xem [`performance-seo.md`](./performance-seo.md)).
- Một Design System vững, nhất quán trên cả 3 app, đủ kỷ luật để không phải retrofit sau này (typography, token, i18n).
- Đa ngôn ngữ (VN + EN) đúng từ đầu, không hard-code rải rác như đã thấy ở `ecommerce-next` (xem ADR 0001).
- Mock-first: phát triển được đầy đủ UI/UX mà không cần chờ backend thật.

## Non-goals (giai đoạn này)

Theo brainstorm-session.md §1, các mục sau **không** nằm trong phạm vi hiện tại:

- Cổng thanh toán online (Stripe/VNPay/MoMo) — MVP chỉ COD (Decision #7).
- Dashboard BI nâng cao.
- Chốt framework backend thật (Modular Monolith NestJS trong `implementation-plan.md` chỉ là *tham khảo*, chưa phải quyết định — xem Decision #11).
- Kiến trúc Microservices, Kafka, Kubernetes, multi-region — các ý này xuất hiện trong `vision-sketch.md`/`nike-ui-ux-analysis.md` như định hướng dài hạn "nếu scale tới 1 triệu user", không áp dụng cho giai đoạn hiện tại.

## Users

| Vai trò | App | Ghi chú |
|---|---|---|
| Guest / Customer (authenticated) | `storefront` | Đa Locale (vi, en) — ADR 0002. Authentication có trong MVP — Decision #20 |
| Content Editor, Order Operator, ... | `admin`, `cms` | Chỉ tiếng Việt — ADR 0002. Có authentication (luôn cần, không phải câu hỏi mở); danh sách role cụ thể và ma trận phân quyền (RBAC) vẫn là **[Mở]**, xem [`authentication-authorization.md`](./authentication-authorization.md) |

## Nguyên tắc chỉ đạo (Guiding principles)

Bốn nguyên tắc dưới đây chi phối mọi quyết định kiến trúc trong bộ tài liệu này:

1. **Foundation-first** [Đã chốt — Decision #10]. Xây design token → core UI component → core function trước, feature module sau. Chấp nhận rủi ro over-engineering đã được cảnh báo trong brainstorm, đổi lấy một nền tảng vững cho một dự án không deadline.
2. **Mock-first, không phải Contract-first-nghiêm-ngặt** [Đã chốt — Decision #3, làm rõ thêm bởi Decision #13]. Dự án áp dụng *tinh thần* Contract-first của `implementation-plan.md` — schema (Zod) phải tồn tại trước khi component tiêu thụ nó — nhưng **không** áp dụng toàn bộ nghi thức review 43-tuần của `implementation-plan.md` (danh sách tài liệu tham khảo, không phải chuẩn bắt buộc — Decision #11). Chi tiết ở [`api-integration.md`](./api-integration.md).
3. **YAGNI có kỷ luật**. Không khai báo trước component token cho 30+ component chưa tồn tại (§8); không tách `layouts` thành package riêng khi chưa có nhu cầu thật (Decision #12); không xây `Market` domain khi chỉ có một market (Decision #14).
4. **Một nguồn sự thật cho mọi khái niệm dễ lặp lỗi**. Danh sách locale (ADR 0001), domain glossary (`glossary.md`) — tránh lặp lại lỗi hard-code rải rác đã thấy ở `ecommerce-next/middleware.ts`.

## Observability & error handling [Mở]

Chưa có Decision Log entry nào cho chủ đề này — khác với phần lớn nội dung khác trong bộ tài liệu này, đây là một khoảng trống chưa từng được đánh dấu, không phải một quyết định hoãn có chủ ý. Cần trả lời trước khi implement feature thật (chậm nhất là Phase 5): chiến lược error boundary phía client (per-route hay per-feature), công cụ logging/monitoring lỗi runtime (vd: Sentry — chỉ xuất hiện trong tài liệu tham khảo không ràng buộc, chưa phải quyết định), và cách phân biệt lỗi cần báo cho user (toast, ví dụ `OUT_OF_STOCK` ở [`api-integration.md`](./api-integration.md)) với lỗi cần báo cho dev (uncaught exception, network failure ngoài dự kiến).

## Bản đồ tài liệu

Xem [`README.md`](./README.md) — mục "Chỉ mục tài liệu".
