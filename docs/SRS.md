# SRS

Đây là tài liệu yêu cầu chính của dự án.

Nếu chỉ giữ một tài liệu để trả lời câu hỏi "hệ thống phải làm gì", hãy giữ file này.

## 1. Mục tiêu hệ thống

Xây một website e-commerce thời trang và giày thể thao gồm 3 phần:

- `Storefront`: nơi khách hàng duyệt và mua hàng
- `Admin`: nơi vận hành nội bộ
- `CMS`: nơi quản lý nội dung storefront

MVP ưu tiên:

- duyệt sản phẩm
- xem chi tiết sản phẩm
- cart
- wishlist
- authentication
- checkout COD
- account core
- Admin đủ dùng
- CMS đủ dùng

## 2. Người dùng

- `Guest shopper`
- `Authenticated shopper`
- `Admin operator`
- `Content editor`

`RBAC` chi tiết cho Admin/CMS hiện chưa chốt đầy đủ.

## 3. Functional Requirements

### 3.1. Storefront

- Duyệt sản phẩm theo `Category`
- Filter theo `Gender`
- PLP có `filter`, `sort`, `pagination`, `URL-as-state`
- PDP chọn `Variant` để ra đúng `SKU`
- Hiển thị giá và tồn kho theo `SKU`
- Search cơ bản theo tên/mô tả/category, không phân biệt dấu và chịu được sai chính tả nhẹ; backend dùng PostgreSQL FTS + `unaccent` + `pg_trgm`
- Cart cho guest và authenticated user
- Wishlist cho guest và authenticated user
- Merge cart sau login
- Merge wishlist sau login
- Checkout chỉ hỗ trợ `COD`
- Sign up, sign in, forgot password, reset password
- Profile, address, order history
- Hỗ trợ `vi` và `en` cho storefront

### 3.2. Admin

- Product CRUD
- Category management
- Basic inventory management
- Order status management
- UI chỉ tiếng Việt
- Authorization ở mức baseline hiện tại

### 3.3. CMS

- Hero Banner
- Homepage Sections
- Collection Landing Page
- Promotion Banner
- SEO Metadata
- Blog
- Campaign
- Draft
- Preview
- Publish
- UI chỉ tiếng Việt
- Nhập được nội dung đa ngôn ngữ cho storefront

## 4. Non-Functional Requirements

- `Storefront`: LCP `< 2.5s`, CLS `< 0.1`, INP `< 200ms`, Lighthouse `> 95`
- `Admin/CMS`: LCP `< 4s`, INP `< 500ms`
- Dự án phải đi theo hướng `mock-first` và `contract-first`
- Không rewrite component khi chuyển từ mock API sang real API
- Security baseline phải được tính từ đầu, không để tới cuối

## 5. Business Rules

- Payment của MVP là `COD-only`
- `Locale` khác `Market`
- Locale mặc định là `vi`
- Thiếu translation thì fallback về `vi`
- Chỉ storefront là đa ngôn ngữ UI
- `CartItem` tham chiếu trực tiếp `SKU`
- Merge cart là cộng quantity rồi clamp theo stock
- `WishlistItem` tham chiếu `Product`
- Move-to-cart từ wishlist:
  - Có variant: về PDP để chọn
  - Không có variant: add thẳng
- Reservation chỉ bắt đầu khi start checkout
- Order follow state machine cho COD
- Return window là `7 ngày`

## 6. Validation Rules

- Chưa chọn đủ variant thì không xác định được SKU
- Add-to-cart phải fail hoặc rollback nếu out of stock hoặc price changed
- `Localized Text` bắt buộc có giá trị ở locale mặc định `vi`
- Password tối thiểu `10` ký tự
- Reset token phải one-time use và có TTL
- Auth endpoints phải có rate limiting

## 7. Permissions

- Browse storefront public không cần auth
- Account routes cần auth
- Admin/CMS permission thật phải enforce ở backend
- FE route guard chỉ là UX layer

## 8. Out Of Scope

- Online payment gateway
- Third-party headless CMS
- Recommendation engine
- AI search nâng cao
- Loyalty, gift card
- Multi-currency
- Multi-warehouse
- Microservices

## 9. Open Questions

- Catalog thật và SKU seed ban đầu
- RBAC chi tiết cho Admin/CMS
- Analytics tool
- Monitoring/tracing vendor và dashboard/alert ownership; runtime logging đã chốt ở Decision #70
- Backend infra chính thức; runtime/framework, PostgreSQL và Prisma đã chốt ở Decision #60–62

## 10. Nguồn gốc nội dung

File này rút gọn từ:

- `00-core/requirements/functional-requirements.md`
- `00-core/glossary.md`
- `00-core/decision-log.md`
- `01-delivery/specification/srs.md`
