# Kế hoạch tái cấu trúc Storefront

Phạm vi thực thi là `fe-ecommerce-nike-style`. `be-demo` phát hành hợp đồng và sở hữu nghiệp vụ. `cms` là back-office, tham gia nghiệm thu các luồng cần thao tác vận hành.

Nguồn đối chiếu liên repo gồm [Glossary Map](./three-repo-restructure.md#glossary-map), [cây đích v3](./three-repo-restructure.md#cây-thư-mục-đích), [master plan](./three-repo-restructure.md#kế-hoạch-triển-khai) và [spec 11](./three-repo-restructure.md#spec-11). Dùng bản cập nhật API-first ngày 14/11/2026 của master plan để sắp thứ tự triển khai. Dùng spec 11 cho hành vi và tiêu chí nghiệm thu.

## Đồng bộ cấu trúc tháng 11/2026

Source đã chuyển sang `src/features` và `src/shared`; setup và helper test chung ở `src/testing`. [Bản đồ cấu trúc](storefront-target-module-tree.md) mô tả checkout hiện tại. Các mục dưới là kế hoạch cutover API và cleanup cần kiểm chứng, không phải danh sách file còn phải chuyển từ cấu trúc cũ.

## Baseline và đánh giá

| Hạng mục    | Hiện trạng                                                                                                               | Việc còn lại                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| App độc lập | Next.js đã lên root từ #77, cấu hình được chỉnh tiếp trong #78                                                           | Giữ `pnpm-workspace.yaml` làm nơi khai báo chính sách build và overrides của pnpm cho root              |
| Dọn legacy  | Cleanup xóa `apps/admin`, `apps/cms`, `packages/`, Turbo, proxy microfrontend và MSW back-office                         | Gỡ MSW storefront theo từng hợp đồng đã chuyển và kiểm tra phụ thuộc trước lần gỡ cuối                  |
| Catalog     | #79 nối API thật cho home, PLP, danh mục, search và PDP qua proxy `/api/v1`                                              | Nối Giá áp dụng khi có hợp đồng tương ứng. Mở nút mua khi API Tier 1 trả khả dụng và giỏ server đã chạy |
| Hợp đồng    | `scripts/gen-api.mjs` pin `openapi-v0.5.0` tại baseline và sinh `src/lib/api/generated/openapi.ts`. CI so sánh file sinh | Tăng pin cùng PR dùng capability mới và kiểm tra lỗi theo contract thật                                 |
| Commerce    | Giỏ local, checkout mô phỏng, session và đơn còn phụ thuộc contract chuyển tiếp                                          | Giỏ, Báo giá, Voucher, phí giao hàng, tồn kho và trạng thái Đơn hàng lấy từ API                         |
| Cấu trúc    | Code feature còn nằm ở `app/[locale]/**/_lib`, `core/session` và `shared`                                                | Chuyển từng nhóm theo PR có thể nghiệm thu. Giữ URL, locale và SEO hiện có khi chỉ di chuyển code       |

## Ranh giới đích

- `src/app/[locale]` giữ route, layout và composition. Tám feature đích là `catalog`, `search`, `cart`, `wishlist`, `checkout`, `orders`, `account` và `auth`.
- Chuyển home, danh mục và PDP sang `catalog`. Chuyển search UI và header search sang `search`. Chuyển session và auth UI sang `auth`. Chuyển profile và địa chỉ sang `account`. Đặt tra cứu đơn khách vãng lai trong `orders`. Đưa header, navigation và layout dùng chung vào `components/layout`.
- Feature giữ mapper DTO → view model và schema form. `src/lib/api` giữ transport, typed endpoint và lỗi chuẩn hóa. Dùng alias `@/` và entry point public khi compose các feature. Component render từ view model. Kiểm tra boundary qua ESLint trước khi xóa đường dẫn cũ.
- Theo glossary `be-demo`, Người mua chọn **Biến thể**, SKU là mã định danh của Biến thể. API quyết định Giá áp dụng, lượng có thể bán, Voucher và hành động khả dụng của Đơn hàng. Wishlist là dữ liệu cục bộ theo Sản phẩm, ngoài MVP API.

## Trình tự triển khai

| PR                                 | Điều kiện bắt đầu                                                                     | Phạm vi và tiêu chí nghiệm thu                                                                                                                                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cleanup                            | Root đã độc lập                                                                       | Xóa mã và tooling monorepo dư thừa. Giữ mock phục vụ khách hàng. Frozen install, lint, format, typecheck, test hiện có và build chạy ở root                                                                                                                         |
| Catalog và Giá áp dụng             | OpenAPI có trường và filter/sort tương ứng                                            | Di chuyển catalog/search theo feature. Home, PLP, search và PDP hiển thị Giá áp dụng, Giá bán gạch ngang khi phù hợp. Kiểm tra URL filter và locale. Dùng contract cho `onSale`                                                                                     |
| Tier 1, session và Giỏ hàng        | API công bố contract session Người mua, cookie Giỏ vãng lai, Gộp giỏ và tồn khả dụng  | Nối session qua proxy, cập nhật query cache theo người dùng và giỏ. Thử reload, nhiều tab, Gộp giỏ sau login và giỏ tài khoản trên thiết bị khác. Xóa giỏ local khi có phương án xử lý giỏ cũ đã xác nhận                                                           |
| Tier 1, Checkout COD và Đơn hàng   | API phát hành Báo giá, Voucher, phí giao, đặt đơn idempotent, lịch sử, huỷ và tra cứu | Mở mua hàng cùng luồng COD thật. Thử Giá áp dụng hoặc tồn thay đổi sau Báo giá, Voucher bị từ chối và retry sau timeout với cùng khóa idempotency. Hiển thị Báo giá mới để xác nhận lại. Tra cứu bằng Mã đơn và số điện thoại. Đi tay một đơn từ storefront đến CMS |
| Tier 2, Tài khoản                  | API địa chỉ, hồ sơ, ngôn ngữ và bestseller được phát hành                             | Nối sổ địa chỉ, hồ sơ, ngôn ngữ và dữ liệu bán chạy theo contract. Thử chọn địa chỉ tại checkout và kiểm tra dữ liệu tài khoản khi đăng xuất rồi đăng nhập tài khoản khác                                                                                           |
| Tier 3, Tích hợp                   | Contract payment, GHN và session mới sẵn sàng                                         | Chuyển đến cổng thanh toán từ URL do API trả. Trang kết quả tải trạng thái từ API sau redirect. Thử callback đến muộn, phiên thanh toán hết hạn và luồng phí vận chuyển theo Báo giá                                                                                |
| Tier 4, Hậu mãi và dữ liệu cá nhân | Contract đổi trả, hoàn tiền, consent, yêu cầu dữ liệu và review theo từng đợt         | Hiển thị tiến trình theo Đơn hàng và Dòng đơn. Chỉ render hành động API cho phép. Đi tay đổi trả một phần, hoàn tiền, lựa chọn xử lý dữ liệu và review đủ điều kiện mua                                                                                             |
| Hoàn tất MSW và Phase 7            | Mọi runtime consumer đã được thay hoặc bỏ theo scope                                  | Xóa startup, worker, env, fixture và dependency MSW còn lại sau khi rà cả test harness. Cập nhật test theo Verification matrix của master plan và xác minh hành trình thật                                                                                          |

## Rủi ro và điểm kiểm tra

- **Giỏ cũ.** ID giả có thể không ánh xạ được sang Biến thể thật. Trước cutover, kiểm kê dữ liệu localStorage và thống nhất cách xử lý với chủ sản phẩm nếu có dữ liệu người dùng thật. Kiểm tra Gộp giỏ đồng thời ở hai tab theo contract.
- **Session và cache.** Kiểm tra thuộc tính cookie qua proxy, logout/refresh, và phân tách cache của từng người mua. Backend xác thực và kiểm tra quyền sở hữu. Kiểm tra service worker tránh lưu response tài khoản, Giỏ hàng và Báo giá.
- **Đơn trùng và Báo giá cũ.** Giữ khóa idempotency cho retry của cùng lần xác nhận theo contract. Nếu Báo giá đổi, hiển thị dữ liệu API mới và yêu cầu Người mua xác nhận.
- **Rollback.** Duyệt catalog có thể quay về phiên bản API tương thích đã pin. Khi luồng mua thật lỗi, tạm khóa thao tác mua bị ảnh hưởng và giữ dữ liệu Đơn hàng phía server. Mock chỉ phục vụ phát triển.
- **Mỗi PR.** Chạy kiểm tra hẹp rồi chạy lint, format, typecheck, test hiện có và build. Nếu đổi hợp đồng, sinh lại types và kiểm tra diff. Nếu đổi luồng trình duyệt, đi tay theo tier và chạy E2E phù hợp. Bổ sung bộ test theo Phase 7 của master plan.

## Checklist cleanup kỹ thuật

Các mục dưới đây xuất phát từ đợt rà tháng 11/2026. Kiểm tra lại tồn tại, đường dẫn và consumer ở checkout hiện tại trước khi tạo ticket xóa hoặc di chuyển. Đối chiếu [cây thư mục đích](storefront-target-module-tree.md) khi chọn vị trí mới.

### Ứng viên cần kiểm chứng

| Mục                                                                                                                   | Bằng chứng ở checkout                                                                                                                                                                              | Đề xuất và điều kiện                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/{next,vercel,file,globe,window}.svg`                                                                          | Không thấy tên file trong mã, test, manifest hay cấu hình được rà                                                                                                                                  | Ứng viên xóa ưu tiên. Kiểm tra thêm tham chiếu qua URL động và nơi deploy phục vụ asset công khai                                              |
| `src/shared/constants/auth-cookies.ts`, `src/features/auth/session/roles.ts` và nhánh Admin trong `src/middleware.ts` | Cookie `is_admin` còn được đọc ở middleware. `isAdminRole` còn đi qua `useAuth` và test. Không thấy route Admin trong App Router                                                                   | Gỡ cùng luồng role Admin cũ sau khi kiểm tra redirect và toàn bộ consumer. Giữ hành vi bảo vệ tài khoản và checkout hiện hành trong PR cleanup |
| Các hàm quản trị trong `src/lib/api/mocks/{catalog,order}-fixtures.ts`                                                | Handler back-office đã được xóa. `createProduct`, `deleteProduct`, `getAllOrders` và `approveOrderReturn` không thấy consumer ngoài module. `findProductBySkuId` vẫn được gọi khi mô phỏng đặt đơn | Gỡ theo cụm hàm đã mất consumer. Giữ fixture chia sẻ với Giỏ hàng, Wishlist và Đơn hàng. Chạy test cho luồng MSW còn hoạt động                 |
| MSW, `public/mockServiceWorker.js`, Zod transport cũ                                                                  | Luồng khách hàng và test vẫn gọi chúng                                                                                                                                                             | Gỡ theo từng contract thật. Xóa dependency ở lần cuối sau khi kiểm tra cả bootstrap, Vitest và Playwright                                      |
| `pnpm-workspace.yaml`, file sinh OpenAPI và asset PWA                                                                 | pnpm còn dùng `allowBuilds`/overrides. Generator và CI còn dùng type sinh. Manifest và worker có entry point riêng                                                                                 | Giữ. Chỉ xem xét đổi khi có phương án thay thế và kiểm tra tương ứng                                                                           |

Trước mỗi đợt xóa, kiểm kê import và re-export, dynamic import, file convention Next.js, scripts/hooks/CI, CSS, URL asset, Playwright, Vitest và nguồn sinh. Kết quả scan unused là danh sách ứng viên. Với dependency, kiểm tra cả config và CLI trước khi sửa manifest và lockfile.

### Ranh giới module cần rà

#### A. Catalog và tìm kiếm — ưu tiên cao

- **Hiện tại.** `src/lib/api/endpoints/catalog.ts`, `src/lib/api/models/catalog.ts` và `app/[locale]/(shop)/_lib` cùng tham gia chuyển dữ liệu. Khi đổi filter hoặc Giá áp dụng, cần lần theo route, URL state, query và mapper.
- **Đề xuất.** Đưa logic chuyển URL, view model và trạng thái hiển thị vào các module catalog/search theo kế hoạch đích. Giữ transport chung và mapper đã có giá trị. Deletion test áp dụng cho wrapper chỉ chuyển tiếp tham số. Giữ module giữ quy tắc chuẩn hóa hoặc cấu hình cache.
- **Leverage và locality.** PLP, danh mục và search dùng nhất quán filter, phân trang và thứ tự. Dùng test hiện có và đi tay qua deep link, back/forward, PDP theo slug, kết quả trống và lỗi từ API ở cả `vi`/`en`.

#### B. Session Người mua và transport — ưu tiên cao

- **Hiện tại.** `src/features/auth (runtime provider, session store và useAuth)`, `src/lib/api/client/{fetcher,runtime}` và `src/middleware.ts` chia nhau bootstrap, refresh và redirect. Adapter phải đăng ký trước bootstrap. Fetcher có cơ chế gộp refresh khi nhiều request trả 401.
- **Đề xuất.** Đưa session Người mua vào module auth và làm rõ seam với transport. Giữ quy tắc retry và cơ chế gộp refresh khi chuyển mã. Gỡ interface role Admin còn sót theo bảng trên.
- **Leverage và locality.** Luồng gọi endpoint có chung hành vi khi hết phiên. Kiểm tra 401 đồng thời, refresh lỗi, logout, redirect hợp lệ, SSR và chuyển tài khoản. Chốt thuộc tính cookie khi có hợp đồng Người mua đã pin.

#### C. Giỏ hàng, Tính thử và đặt Đơn hàng — ưu tiên theo Tier 1

- **Hiện tại.** `useCart.ts` vừa hydrate localStorage, vừa giữ Zustand, Gộp giỏ và tính tổng. Checkout/Đơn hàng còn chạy bằng endpoint và fixture mô phỏng. Interface hiện tại buộc caller biết khi nào Giỏ hàng đã hydrate và khi nào SKU đã resolve.
- **Đề xuất.** Chuyển quyền quyết định Giỏ hàng và Tính thử sang backend theo contract Tier 1. Tập trung logic form, hiển thị lỗi và xác nhận lại trong module checkout. Gỡ các adapter/mock cũ khi toàn bộ consumer tương ứng đã chuyển.
- **Leverage và locality.** Kiểm tra qua luồng Người mua thay vì thao tác trực tiếp store. Bao phủ Gộp giỏ sau login, nhiều tab, Tính thử hết hiệu lực, Voucher lỗi và retry đặt đơn cùng khóa idempotency. Chốt cách xử lý giỏ local cũ trước khi bật mua thật.

#### D. UI, CSS và cấu hình — ưu tiên sau kiểm kê

- **Hiện tại.** UI primitives, layout và tiện ích nằm ở `src/features/storefront-shell`, các feature và `src/shared`. Mã 3D, PWA, i18n và giám sát có entry point riêng.
- **Đề xuất.** Chuyển layout dùng chung theo cây đích. Chỉ hợp nhất module khi trùng hành vi và có cùng lý do thay đổi. Kiểm kê dependency qua import, CSS, file config và scripts. Đo bundle trước và sau nếu PR nhắm tới tải trang hoặc chia chunk.
- **Leverage và locality.** Giảm số nơi sửa hành vi dùng chung. Xác minh mobile/desktop, keyboard, locale, offline và 3D ở nơi có thay đổi. Giữ giao diện và URL khi PR chỉ di chuyển code.
