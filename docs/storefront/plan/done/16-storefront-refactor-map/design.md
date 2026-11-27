# Thiết kế migration Storefront — hồ sơ đã hoàn tất

Thiết kế được duyệt ngày 24/11/2026; quyết định Wayfinder và các đợt triển khai 34–48 đã hoàn tất. File này giữ thiết kế gốc và đường dẫn bằng chứng. Kiến trúc đang vận hành đọc tại [architecture](../../../architecture.md); quyết định nền ở [ADR 0001](../../../../adr/0001-domain-modules-and-readable-names.md).

## Thiết kế đã chọn

```text
src/
├── app/                   # Entry point và composition Next.js
├── providers/             # Query, theme và session runtime
├── layouts/               # Shell và composition giữa module
├── modules/               # Nghiệp vụ theo domain/chức năng
│   ├── catalog/
│   ├── home/
│   ├── auth/
│   ├── account/
│   ├── cart/
│   ├── wishlist/
│   ├── checkout/
│   └── orders/
├── integrations/backend/  # HTTP, schema, contract và adapter
├── shared/                # UI/helper dùng chung
├── i18n/                  # Routing và cấu hình locale
├── lang/                  # Messages
├── styles/
├── pwa/
└── testing/
e2e/
```

Module-first, route mỏng; áp dụng Clean/Hexagonal chọn lọc khi có boundary thực sự. Không tạo đủ tầng, service hoặc repository chỉ để đúng mẫu. Folder kỹ thuật chỉ xuất hiện khi có trách nhiệm cụ thể; chức năng lớn gom theo tên dễ hiểu như `shipping-address`.

Component dùng PascalCase, hook dùng `use...`; service/type/schema/store dùng suffix tương ứng. Test cạnh owner với tên `.test.ts(x)`. Type dùng riêng đặt cạnh consumer; form schema thuộc module, transport schema thuộc integration. Không thêm enum hay tiền tố interface `I`.

Module chỉ import public entry được cấp phép; không deep import, dependency cycle hoặc barrel mới. Catalog nhận wishlist slot từ composition để giữ dependency một chiều. Runtime browser và server tách riêng; public SSR không dùng singleton session hoặc QueryClient xuyên request.

## Lộ trình đã thực hiện

| Đợt   | Phạm vi                                                         | Hồ sơ                                                                                                                                                                                       |
| ----- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 34–35 | Baseline kiểm chứng và rule hỗ trợ migration                    | [34](../34-storefront-verification-foundation/spec.md), [35](../35-storefront-migration-rules/spec.md)                                                                                      |
| 36–39 | Shared, providers/layouts, catalog pilot và Backend integration | [Backlog chi tiết](../21-storefront-delivery-breakdown/delivery.md)                                                                                                                         |
| 40–44 | Các module còn lại, route mỏng và gỡ compatibility              | [Handoff](../21-storefront-delivery-breakdown/handoff.md)                                                                                                                                   |
| 45–48 | SSR public catalog, category/search, PDP/related và home        | [45](../45-storefront-ssr-products/spec.md), [46](../46-storefront-ssr-category-search/spec.md), [47](../47-storefront-ssr-product-detail/spec.md), [48](../48-storefront-ssr-home/spec.md) |

Di chuyển cấu trúc giữ URL, locale, session/cache lifecycle, API contract và behavior. SSR là đợt runtime riêng sau migration, dùng reader public và hydration theo request. Hoàn tất refactor không đồng nghĩa commerce API đã cutover hoặc browser SSR đã có đủ bằng chứng; xem [roadmap](../../../roadmap.md).

## Tra cứu quyết định và kiểm chứng

- [Map ticket 16](spec.md): câu hỏi, quyết định và phạm vi ban đầu.
- [Inventory 17](../17-storefront-migration-inventory/inventory.md): mapping file/consumer.
- [Public boundary 18](../18-storefront-module-boundaries/boundaries.md): dependency được phép.
- [Runtime 19](../19-storefront-runtime-boundaries/runtime.md): session, cache và server/client.
- [Verification 20](../20-storefront-verification-policy/verification.md): gate và giới hạn bằng chứng.
- `report.md` của từng đợt triển khai: việc đã làm, checks và rủi ro cụ thể. Không suy ra pass từ sự tồn tại của report.
