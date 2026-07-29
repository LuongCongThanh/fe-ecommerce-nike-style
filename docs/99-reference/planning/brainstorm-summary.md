# Brainstorm Summary — Nền tảng E-commerce mới (FE)

> Đây là bản tóm tắt ngắn của [`brainstorm-session.md`](brainstorm-session.md). Dùng file này để nắm bối cảnh nhanh. Chỉ quay lại file gốc khi bạn thật sự cần narrative đầy đủ, assumptions ban đầu, hoặc reasoning chi tiết.

## Dự án này là gì

- Một nền tảng e-commerce thời trang và giày thể thao mới, độc lập với `ecommerce-next`.
- Monorepo Turborepo gồm 3 app: `storefront`, `admin`, `cms`.
- Dự án hướng kinh doanh thật, không phải portfolio hay bài tập.
- Hiện là mô hình solo dev, không có deadline cứng.

## Điều gì đã chốt sớm

- Dự án đi theo hướng **Foundation-first**: dựng design system, core component, core function trước feature.
- Giai đoạn hiện tại là **mock-first**: chưa có backend thật, dùng MSW và schema contract để phát triển FE.
- MVP chỉ hỗ trợ **COD**, không tích hợp payment gateway online.
- `storefront` hỗ trợ **VN + EN** ngay từ đầu.
- `admin` và `cms` có auth, nhưng UI chỉ tiếng Việt.
- CMS là **tự xây**, không dùng headless CMS bên thứ ba.

## Ràng buộc lớn hiện tại

- Chưa có backend thật.
- Chưa có catalog sản phẩm thật, SKU thật, hay bộ nhận diện thương hiệu cuối.
- RBAC chi tiết cho `admin` và `cms` vẫn chưa chốt.
- Hosting, CI/CD, analytics tool cụ thể vẫn để giai đoạn sau.

## Những câu hỏi còn mở đáng chú ý nhất

1. Catalog thật, category thật, SKU ban đầu là gì.
2. RBAC chi tiết cho `admin` và `cms`.
3. Quan sát vận hành sau này: logging, monitoring, analytics tool.
4. Backend framework thật chỉ cần chốt khi bước vào giai đoạn tích hợp API thật.

## Nên đọc gì tiếp theo

- Nếu cần quyết định đã chốt: [`decision-log.md`](../../00-core/decision-log.md)
- Nếu cần scope MVP: [`../requirements/functional-requirements.md`](../../00-core/requirements/functional-requirements.md)
- Nếu cần launch framing: [`../product/release-slicing.md`](../../01-delivery/product/release-slicing.md)
- Nếu cần thứ tự build kỹ thuật: [`../architecture/frontend/11-roadmap.md`](../../01-delivery/architecture/frontend/11-roadmap.md)

## Khi nào dùng file gốc

Mở [`brainstorm-session.md`](brainstorm-session.md) khi bạn cần:

- hiểu đầy đủ reasoning ban đầu,
- xem assumptions và open questions theo ngữ cảnh gốc,
- hoặc truy lại vì sao một lựa chọn từng bị loại.

Nếu không có một trong ba nhu cầu này, file tóm tắt thường đã đủ.
