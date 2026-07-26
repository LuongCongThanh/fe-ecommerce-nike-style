# Routing

## Storefront [Đã chốt — Decision #18]

Dùng lại pattern `app/[locale]/...` với `next-intl`, đã được kiểm chứng ở `ecommerce-next`. `SUPPORTED_LOCALES` lấy từ `packages/utils` (nguồn sự thật duy nhất — xem [`i18n-locale.md`](./i18n-locale.md)), **không** tự thiết kế lại middleware locale detection từ đầu.

Route groups đề xuất [Đề xuất — dựa trên `ideal.md` sitemap + phạm vi storefront MVP, **chưa** là quyết định chốt vì brainstorm chưa có Decision Log entry riêng cho sitemap]:

```
apps/storefront/src/app/[locale]/
├── (marketing)/            # Home, editorial/story pages
├── (shop)/
│   ├── [category-slug]/    # PLP theo category
│   ├── product/[slug]/     # PDP
│   ├── search/
│   ├── wishlist/
│   └── cart/
├── (checkout)/
│   └── checkout/           # COD only — Decision #7
└── (account)/
    ├── profile/
    ├── orders/
    └── wishlist/
```

**Mở**: danh sách category thật (men/women/kids/sports...), catalog/SKU ban đầu — phụ thuộc Open Question "Catalog sản phẩm thật" trong brainstorm-session.md §3. Route groups trên là khung, không phải sitemap cuối cùng.

**Route file là lớp mỏng** [Đã chốt — Decision #29]: mỗi file `page.tsx` trong `app/[locale]/...` chỉ import và render page component từ barrel của feature tương ứng trong `features/{feature}/` — không chứa logic, không tự fetch. Cấu trúc `features/{feature}/pages/{page}/` cụ thể xem [`module-architecture.md`](./module-architecture.md#cấu-trúc-nội-bộ-trong-từng-apps).

## Admin / CMS [Đã chốt — Decision #17]

Không có segment `[locale]`. Route nằm trực tiếp dưới `app/`:

```
apps/admin/src/app/
├── (dashboard)/
├── products/
└── orders/

apps/cms/src/app/
└── ...            # Route cụ thể theo phạm vi CMS Phase 1 [Đã chốt — Decision #21]:
                    # Hero Banner, Homepage Sections, Collection Landing Page,
                    # Promotion Banner, SEO Metadata, Blog, Campaign — xem roadmap.md
```

## URL-as-state cho filter/sort/pagination [Đề xuất — adopted from `FE-first.md`, không mâu thuẫn quyết định nào]

Trạng thái filter/sort/pagination của PLP đi vào query string, không lưu độc lập trong Zustand:

```
/[locale]/men/shoes?color=black&size=42&sort=price-asc&page=2
```

Lý do (không đổi so với nguyên tắc FE tổng quát, không cần một quyết định brainstorm riêng để áp dụng):

- Chia sẻ được URL, back/forward hoạt động đúng.
- SEO và phân tích hành vi dễ theo dõi hơn state chỉ tồn tại trong bộ nhớ client.
- Reload không mất trạng thái filter.

Chi tiết ai sở hữu state nào (URL vs server state vs client state) — xem [`state-management.md`](./state-management.md).
