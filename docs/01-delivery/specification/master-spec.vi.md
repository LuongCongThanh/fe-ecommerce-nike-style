# Master Spec

Tài liệu này là bản tổng hợp tiếng Việt của 5 file:

- `prd.md`
- `srs.md`
- `technical-design.md`
- `implementation-plan.md`
- `traceability-matrix.md`

Mục tiêu của file này là giúp một người mới vào dự án có thể đọc một chỗ và hiểu:

- dự án này đang giải quyết bài toán gì
- MVP gồm những gì
- các rule nghiệp vụ nào đã chốt
- kiến trúc hiện tại và kiến trúc mục tiêu là gì
- nên triển khai theo thứ tự nào
- requirement nào sẽ được chứng minh bằng test và evidence gì

File này là bản tổng hợp để đọc nhanh. Nguồn chi tiết vẫn nằm ở các file thành phần trong cùng thư mục và ở lớp `00-core/`.

## 1. Bức tranh tổng quan

Đây là dự án xây một nền tảng e-commerce thời trang và giày thể thao thật, theo hướng business thực tế chứ không phải portfolio hay bài tập. Dự án được thiết kế như một monorepo gồm 3 ứng dụng:

- `storefront`: ứng dụng khách hàng cuối để duyệt sản phẩm và mua hàng
- `admin`: ứng dụng vận hành nội bộ
- `cms`: ứng dụng biên tập nội dung

Tuy nhiên, tại thời điểm rà soát ngày 29/07/2026, repo `E:\my-pj\FE` vẫn đang ở trạng thái tài liệu là chính. Trong repo hiện chỉ thấy `.idea` và `docs`, chưa có scaffold code thật cho `apps/*` hay `packages/*`.

Nói ngắn gọn:

- business direction đã khá rõ
- requirement và decision log đã khá đầy đủ
- technical delivery direction đã có khung
- codebase thực tế vẫn chưa bắt đầu

## 2. Bài toán cần giải quyết

Dự án cần giải quyết 3 nhóm vấn đề chính.

### 2.1. Bài toán khách hàng

Người mua cần một storefront đủ hoàn chỉnh để:

- duyệt sản phẩm theo category
- lọc theo gender
- xem chi tiết sản phẩm
- chọn variant để ra đúng SKU
- thêm vào cart
- dùng wishlist
- đăng ký, đăng nhập
- checkout theo hình thức COD
- theo dõi thông tin tài khoản và lịch sử đơn hàng

### 2.2. Bài toán vận hành

Người vận hành nội bộ cần đủ công cụ để:

- quản lý sản phẩm
- quản lý category
- quản lý tồn kho cơ bản
- cập nhật trạng thái đơn hàng
- quản lý nội dung storefront bằng CMS

### 2.3. Bài toán delivery

Vì chưa có backend thật, dự án cần một hướng đi cho phép:

- thiết kế frontend trước
- chốt contract trước
- mock flow trước
- về sau gắn backend thật mà không phải viết lại toàn bộ component

Đây là lý do dự án chọn hướng:

- foundation-first
- mock-first
- contract-first

## 3. Mục tiêu sản phẩm

Các mục tiêu chính đã suy ra từ tài liệu gốc là:

1. Có thể hoàn tất luồng đặt hàng COD từ đầu đến cuối.
2. Có storefront hỗ trợ `vi` và `en` ngay từ đầu.
3. Có Admin và CMS đủ dùng cho MVP nội bộ.
4. Có kiến trúc đủ rõ để chuyển từ mock sang API thật mà không đập đi làm lại frontend.
5. Giữ nhịp triển khai phù hợp với bối cảnh solo developer, ưu tiên chất lượng hơn deadline.

## 4. Scope MVP

### 4.1. Storefront

MVP storefront bao gồm:

- duyệt sản phẩm theo Category
- filter theo Gender
- PLP có filter, sort, pagination, URL-as-state
- PDP chọn variant ra đúng SKU
- hiển thị giá và tồn kho theo SKU
- search cơ bản
- cart cho guest và authenticated user
- wishlist cho guest và authenticated user
- merge cart sau login
- merge wishlist sau login
- checkout COD
- auth gồm sign up, sign in, forgot/reset password
- account core gồm profile, address, order history
- đa ngôn ngữ `vi` và `en` cho storefront UI và nội dung product/CMS hiển thị ra storefront

### 4.2. Admin

MVP Admin gồm:

- product CRUD
- category management
- inventory management ở mức cơ bản
- order status management
- UI chỉ tiếng Việt
- authorization theo baseline hiện hành

### 4.3. CMS

MVP CMS Phase 1 gồm toàn bộ các content type sau:

- Hero Banner
- Homepage Sections
- Collection Landing Page
- Promotion Banner
- SEO Metadata
- Blog
- Campaign

Ngoài ra CMS còn phải có:

- draft
- preview
- publish
- UI tiếng Việt
- nhưng vẫn nhập được nội dung đa ngôn ngữ cho storefront

## 5. Out Of Scope

Các mục sau hiện không nằm trong MVP:

- payment gateway online
- headless CMS bên thứ ba
- chốt backend framework thật ngay bây giờ
- chốt infra production thật ngay bây giờ
- RBAC chi tiết nhiều role vượt baseline hiện tại
- recommendation engine
- AI search nâng cao
- loyalty
- gift card
- multi-currency
- multi-warehouse
- microservices

## 6. User và vai trò

Hiện có thể nhìn hệ thống theo các nhóm user sau:

- guest shopper
- authenticated shopper
- admin operator
- CMS content editor
- product/founder decision maker

Lưu ý:

- role chi tiết cho Admin/CMS hiện vẫn chưa chốt đủ sâu
- tài liệu mới không tự bịa thêm role beyond baseline

## 7. User journey chính

### 7.1. Journey khách mua hàng

`Browse -> PLP -> PDP -> chọn variant -> add to cart -> checkout COD -> order success`

### 7.2. Journey user quay lại

`Guest browse/wishlist/cart -> sign in -> merge state -> account -> order history`

### 7.3. Journey Admin

`Login -> quản lý product/category/inventory/order state`

### 7.4. Journey CMS

`Login -> tạo/sửa content -> preview -> publish -> storefront chỉ đọc content published`

## 8. Rule nghiệp vụ đã chốt

Đây là phần rất quan trọng vì sau này code, test, và API contract đều phải đi theo.

### 8.1. Locale và i18n

- `Locale` khác với `Market`
- chỉ có danh sách locale đóng trong code
- locale hiện tại là `vi` và `en`
- locale mặc định là `vi`
- thiếu bản dịch không chặn publish, storefront fallback về `vi`
- chỉ `storefront` là đa locale UI
- `admin` và `cms` chỉ tiếng Việt ở UI
- typography token dùng chung cho mọi locale, không override theo locale

### 8.2. Catalog

- `Product` là cấp sản phẩm người dùng nhận biết
- `Variant` là tổ hợp `{Color?, Size?}`
- `SKU` là đơn vị bán hàng và tồn kho cuối cùng
- giá và tồn kho gắn với `SKU`
- Product không có variant thì map 1-1 với một hidden SKU

### 8.3. Cart

- `CartItem` tham chiếu trực tiếp `skuId`
- merge cart sau login là cộng quantity rồi clamp theo `available`
- không reserve stock khi add-to-cart
- reservation chỉ bắt đầu khi start checkout

### 8.4. Order

- checkout MVP là COD-only
- order có state machine riêng cho COD
- order item phải snapshot dữ liệu tại thời điểm mua
- place order cần tư duy idempotency để tránh tạo duplicate order khi retry

### 8.5. Wishlist

- `WishlistItem` tham chiếu `Product`, không phải SKU
- merge wishlist là union theo Product
- move-to-cart:
  - nếu có variant thì đưa về PDP để chọn
  - nếu không có variant thì add thẳng

### 8.6. Return và refund

- return window là 7 ngày sau khi delivered
- `RETURN_REQUESTED` cần approval thủ công
- refund COD chỉ được ghi nhận trong hệ thống, còn chuyển khoản là thủ công

## 9. Requirement structure

Trong bộ tài liệu mới, requirement được tổ chức thành các nhóm sau:

- `PRD-Fxxx`: requirement mức sản phẩm
- `FR-xxx`: functional requirement
- `NFR-xxx`: non-functional requirement
- `BR-xxx`: business rule
- `VR-xxx`: validation rule
- `PERM-xxx`: permission
- `AC-xxx`: acceptance criteria

Mục đích là để sau này trace được từ:

`ý tưởng sản phẩm -> đặc tả -> thiết kế -> task -> test -> evidence`

## 10. Kiến trúc hiện tại

Đây là điểm cần hiểu thật rõ để tránh hiểu nhầm.

### 10.1. Hiện trạng repo

Repo hiện tại chưa phải là codebase ứng dụng.

Hiện chỉ có:

- `docs/`
- `.idea/`

Tức là:

- chưa có `apps/storefront`
- chưa có `apps/admin`
- chưa có `apps/cms`
- chưa có `packages/ui`
- chưa có `packages/api-sdk`
- chưa có `packages/schemas`

### 10.2. Hiện trạng architecture docs

Trong `01-delivery/architecture/`, hiện chỉ có 2 file tóm tắt:

- `frontend`
- `backend`

Nhiều tài liệu traceability đã trỏ đến các file kiến trúc chi tiết kiểu `01-frontend-overview.md`, `07-api-integration.md`, `09-testing.md`, `11-roadmap.md` — các file đó **chưa từng được viết** và đã được xác nhận không viết thêm. Nội dung tương ứng nằm ở [`docs/FE/`](../../FE/README.md) (`FE.md`, `FE-ARCHITECTURE.md`, `FE-EXECUTION.md`) — các link FE-related trong `open-decisions.md`, `reading-paths.md`, `security-baseline.md`, `decision-log.md`, `functional-requirements.md`, và `test-traceability-matrix.md` đã được cập nhật để trỏ đúng vào đó. `requirements-traceability-matrix.md` vẫn còn nhiều cell trỏ theo tên file cũ (xem ghi chú ánh xạ ở đầu file đó) — coverage-level rewrite cho từng dòng chưa làm, chỉ mới có bảng tra nhanh.

Kết luận:

- design direction đã có
- cấu trúc detailed architecture docs chưa đầy đủ trong repo
- vì vậy bộ spec mới phải ghi rõ đâu là fact, đâu là intended architecture

## 11. Kiến trúc mục tiêu

Kiến trúc mục tiêu được tài liệu hiện tại mô tả theo hướng monorepo:

```text
FE/
├── apps/
│   ├── storefront/
│   ├── admin/
│   └── cms/
├── packages/
│   ├── design-tokens/
│   ├── ui/
│   ├── commerce/
│   ├── schemas/
│   ├── api-sdk/
│   ├── hooks/
│   ├── utils/
│   ├── eslint-config/
│   └── ts-config/
└── docs/
```

Trong đó:

- `schemas` giữ contract-first definitions
- `api-sdk` giữ typed client và mock adapter
- `design-tokens` và `ui` tạo foundation cho 3 app
- `commerce` chứa component nghiệp vụ dùng chung khi hợp lý

## 12. Frontend design định hướng

Frontend target design có các điểm nổi bật:

- `storefront` là public app, SEO và performance quan trọng
- `admin` và `cms` là internal app, budget performance nhẹ hơn
- state được tách theo ownership:
  - URL state
  - server state
  - client state
- route guard ở FE chỉ là lớp UX
- quyền thật phải enforce ở backend
- mock API và real API phải giữ nguyên contract

## 13. Backend design định hướng

Backend hiện chưa được chốt công nghệ thật, nhưng hướng thiết kế đã có một số điểm ràng buộc:

- cần theo shared schema contract
- cần hỗ trợ auth bằng `httpOnly` session cookie
- cần error envelope nhất quán
- cần enforce authorization ở server
- cần audit trail cho inventory, order status, publish
- cần sanitize public CMS content
- cần hỗ trợ migration từ mock sang real API mà FE không phải rewrite component

## 14. API contract

Ý tưởng cốt lõi của dự án là:

- contract phải được định nghĩa trước
- FE code dựa trên schema
- mock và real API phải cùng shape

Các contract quan trọng cần có:

- product list/detail
- cart
- wishlist
- auth
- account
- checkout/order
- Admin CRUD flows
- CMS draft/preview/publish flows

Hiện trạng:

- contract intent đã khá rõ
- endpoint inventory chi tiết vẫn chưa hiện diện đầy đủ trong repo hiện tại

## 15. Security baseline

Security là phần đã được định nghĩa tương đối rõ trong docs hiện có.

Các baseline chính:

- session cookie phải `HttpOnly`
- `Secure` khi có HTTPS
- `SameSite` phù hợp
- session phải có timeout
- logout phải invalidate được session
- password có policy tối thiểu
- reset token có TTL và one-time use
- auth endpoint cần rate limit
- mutation dùng cookie auth phải có CSRF strategy trước soft launch
- backend phải enforce permission
- public CMS content phải sanitize
- analytics và logs không được chứa PII/raw secret
- audit trail bắt buộc cho một số action nhạy cảm

## 16. Performance và quality target

### 16.1. Storefront

- `LCP < 2.5s`
- `CLS < 0.1`
- `INP < 200ms`
- `Lighthouse > 95`

### 16.2. Admin/CMS

- `LCP < 4s`
- `INP < 500ms`

Storefront bị ràng buộc chặt hơn vì là public-facing và có SEO.

## 17. Các open question còn tồn tại

Đây là những chỗ tài liệu hiện tại chưa chốt, và bộ spec mới cũng cố ý không tự quyết thay.

### 17.1. Catalog thật

- bán những sản phẩm nào thật
- category tree thật là gì
- số lượng SKU seed ban đầu là bao nhiêu

### 17.2. RBAC chi tiết

- baseline có rồi
- nhưng matrix quyền chi tiết cho Admin/CMS vẫn chưa đủ rõ

### 17.3. Analytics và observability

- dùng tool nào
- ai sở hữu dashboard/event
- logging/monitoring production-like cụ thể ra sao

### 17.4. Backend tech choice

- framework backend
- database
- infra

## 18. Kế hoạch triển khai đề xuất

Trong `implementation-plan.md`, mình đã chia thành 12 task lớn theo thứ tự.

### Nhóm 1. Foundation

- `TSK-001`: scaffold monorepo
- `TSK-002`: schema-first contract + mock API plumbing
- `TSK-003`: locale và localized content foundation

### Nhóm 2. Storefront core

- `TSK-004`: browse, PLP, PDP, search
- `TSK-005`: cart và wishlist
- `TSK-006`: auth và account core
- `TSK-007`: checkout COD và order success

### Nhóm 3. Internal apps

- `TSK-008`: Admin MVP
- `TSK-009`: CMS MVP

### Nhóm 4. Cross-cutting

- `TSK-010`: security baseline implementation
- `TSK-011`: observability và success metrics instrumentation
- `TSK-012`: gắn backend thật và retire production mocks

## 19. Testing strategy

Testing được thiết kế theo nhiều lớp:

- unit test
- frontend integration test qua MSW/mock contract
- E2E test
- backend integration test
- security test
- contract parity test

Một số test ID đã được map từ docs cũ sang plan mới, ví dụ:

- `FE-UNIT-001`: parse/serialize URL state
- `FE-UNIT-002`: chọn đúng SKU từ variant
- `FE-UNIT-003`: locale fallback
- `FE-INT-001..006`: storefront integration flows
- `FE-E2E-001..005`: storefront E2E
- `FE-INT-101..104`: Admin integration
- `FE-E2E-101..102`: Admin E2E
- `FE-INT-201..203`: CMS integration
- `FE-E2E-201..202`: CMS E2E
- `SEC-001..008`: security coverage
- `BE-INT-001..005`: backend contract coverage

Lưu ý rất quan trọng:

- các test này hiện mới là test design/plan
- repo chưa có file test thật
- nên traceability hiện tại là planned traceability, chưa phải proven traceability

## 20. Traceability end-to-end

Điểm mình cố làm trong bộ mới là nối chuỗi sau:

`PRD -> SRS -> Technical Design -> Implementation Task -> Test Case -> Acceptance Evidence`

Ví dụ:

- scope storefront trong PRD map xuống `FR-001..010`
- rồi map xuống technical sections về FE, API, data flow
- rồi map xuống các task `TSK-004..007`
- rồi map xuống các test `FE-UNIT`, `FE-INT`, `FE-E2E`
- cuối cùng map xuống evidence cần có để nói là “done”

Việc này giúp sau này tránh tình trạng:

- có requirement nhưng không có task
- có task nhưng không biết chứng minh bằng test nào
- có test nhưng không rõ đang cover business goal nào

## 21. Những gap còn tồn tại

Sau khi gom toàn bộ tài liệu lại, mình thấy các gap đáng chú ý nhất là:

1. Repo chưa có code scaffold thật.
2. Nhiều file architecture chi tiết đang được docs cũ tham chiếu nhưng không có mặt trong checkout.
3. Endpoint-level contract vẫn chưa được hiện thực rõ theo từng capability.
4. Detailed RBAC vẫn còn mở.
5. Observability/analytics toolchain vẫn còn mở.
6. Test coverage hiện mới ở mức tài liệu, chưa có repo test thật.

## 22. Kết luận sử dụng

Nếu bạn là người mới vào dự án, thứ tự đọc tốt nhất bây giờ là:

1. file này: `master-spec.vi.md`
2. `00-core/requirements/functional-requirements.md`
3. `00-core/glossary.md`
4. `00-core/decision-log.md`
5. `01-delivery/specification/implementation-plan.md`

Nếu bạn là người chuẩn bị implement, thì sau file này nên đọc tiếp:

1. [prd.md](E:/my-pj/FE/docs/01-delivery/specification/prd.md)
2. [srs.md](E:/my-pj/FE/docs/01-delivery/specification/srs.md)
3. [technical-design.md](E:/my-pj/FE/docs/01-delivery/specification/technical-design.md)
4. [implementation-plan.md](E:/my-pj/FE/docs/01-delivery/specification/implementation-plan.md)
5. [traceability-matrix.md](E:/my-pj/FE/docs/01-delivery/specification/traceability-matrix.md)

## 23. Vai trò của file này

File này không thay thế:

- `00-core` làm source of truth
- PRD/SRS/Technical Design/Implementation Plan/Traceability chi tiết

File này chỉ đóng vai trò:

- bản giải thích tiếng Việt
- bản onboarding
- bản đọc nhanh toàn cảnh

Nói ngắn gọn:

- nếu cần quyết định cuối cùng, quay lại `00-core`
- nếu cần làm việc chi tiết, quay lại 5 file spec
- nếu cần hiểu toàn cảnh nhanh, đọc file này trước
