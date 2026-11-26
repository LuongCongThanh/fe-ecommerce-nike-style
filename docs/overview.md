# Sản phẩm và capability hiện tại

Owner: maintainer storefront. Đây là hiện trạng checkout ngày 18/11/2026, không phải chứng nhận production readiness. Sản phẩm phục vụ khám phá thời trang, chọn biến thể và các luồng mua hàng đang chuyển từ mock sang API.

## Real, mock và giới hạn

| Capability           | Bằng chứng sở hữu                                                                           | Data/mode                                                        | Điều kiện và giới hạn                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Home/catalog/PLP/PDP | `src/features/home`, `src/modules/catalog`, `src/integrations/backend/endpoints/catalog.ts` | Catalog API thật `/api/v1`; nội dung editorial/hero tại frontend | Backend có sản phẩm đang bán, ảnh và category; không fallback fixture khi API lỗi          |
| Search               | `src/modules/catalog/search`, `src/modules/catalog/queries/useProductSearch.ts`             | API catalog thật                                                 | URL/query và options theo contract; không giả định search engine riêng                     |
| Auth/account         | `src/modules/auth`, `src/modules/account`, endpoints auth/profile/address                   | Transitional MSW khi mock flag bật                               | Session mock trong memory, F5 mất session; chưa chứng minh cookie auth thật                |
| Cart/wishlist        | `src/features/cart`, `src/features/wishlist`, endpoints cart/wishlist                       | Store client + MSW/persistence chuyển tiếp                       | Cart thật chưa cutover; wishlist ngoài MVP API; không coi local state là nguồn giá/tồn kho |
| Checkout/orders      | `src/features/checkout`, `src/features/orders`, endpoints checkout/orders                   | MSW và fixture                                                   | Không có bằng chứng đặt đơn/payment thật; PDP catalog chưa bật mua hàng theo slice C       |
| i18n                 | `src/i18n`, `src/lang`, `src/app/[locale]`                                                  | `vi`/`en` qua next-intl                                          | Route offline ngoài locale còn copy tiếng Việt; metadata root có giá trị mặc định riêng    |
| PWA                  | `src/pwa/sw.ts`, `next.config.ts`, `src/app/~offline/page.tsx`                              | Serwist production, offline document fallback                    | Development tắt Serwist; offline không bảo đảm giao dịch mua hàng                          |
| 3D                   | HeroSlides3D và ProductViewer3D                                                             | Enhancement client, dynamic import                               | Hero có capability gate/2D fallback; không đồng nhất gate Hero với PDP                     |

Tắt `NEXT_PUBLIC_API_MOCKING` không có nghĩa các flow chuyển tiếp tự tương thích API thật. Xem [API integration](api-integration.md) trước khi đổi mode.

## Route và trải nghiệm

Entry point nằm trong `src/app/[locale]`: nhóm shop cho home/catalog/cart/checkout, auth cho đăng nhập/đăng ký/khôi phục, account cho hồ sơ/địa chỉ/đơn. Route/layout giữ composition và Next.js conventions; module nghiệp vụ nằm trong features. Duyệt file route hiện tại trước khi suy luận URL từ tên feature.

Homepage render theo thứ tự Hero → Featured categories → Editorial collection → New arrivals → Why choose us → Newsletter (`src/app/[locale]/(shop)/home/page.tsx`). Flash sale, Best sellers và Testimonials không nằm trong composition route này. Newsletter/editorial không chứng minh đã có CMS hoặc dịch vụ gửi mail thật.

PDP dùng slug và Product → Variant → SKU theo mapper catalog. Giá, ảnh và lựa chọn size/màu đến từ API; stock/reviews không được suy ra từ fixture. Hành vi chưa có trong pin không được bù bằng số liệu quảng cáo giả.

## Ranh giới sản phẩm

Storefront không sở hữu back-office, API nghiệp vụ, worker hay database migration. Một Store/một Warehouse là invariant của chương trình tích hợp; không có tenant header `X-Store-Id`. Frontend guard chỉ phục vụ UX; API phải kiểm authorization và ownership.

[Roadmap](roadmap.md) tách việc hoàn thiện repository khỏi tier tích hợp sản phẩm. Không lấy các đề xuất microservice, database, stack hoặc cấu trúc trong nghiên cứu UI làm yêu cầu sản phẩm.
