# Tổng quan Storefront

Ứng dụng Next.js phục vụ khám phá và mua sắm thời trang, hỗ trợ tiếng Việt và tiếng Anh. Nội dung dưới đây được đối chiếu checkout ngày 27/11/2026.

## Tính năng hiện tại

| Phạm vi                            | Hiện trạng                                                                | Giới hạn                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Home, danh mục, sản phẩm, tìm kiếm | Catalog dùng API thật; các route chính và phần catalog của home đã có SSR | Hero/editorial/newsletter do frontend quản lý                                 |
| Chi tiết sản phẩm                  | Đọc sản phẩm theo slug, lựa chọn màu/size và ảnh                          | Nút thêm giỏ còn disabled, hiển thị “Sắp mở bán”                              |
| Auth, hồ sơ, địa chỉ               | Có UI và luồng chuyển tiếp qua MSW khi bật mock                           | Token trong memory; reload không khôi phục session mock                       |
| Giỏ hàng, wishlist                 | Có client state, persistence và mock handlers                             | Chưa xác nhận cart server/merge thật; wishlist ngoài MVP API                  |
| Checkout, đơn hàng                 | Có UI và fixture/MSW                                                      | Chưa xác nhận đặt đơn hoặc thanh toán thật                                    |
| i18n, PWA, 3D                      | `vi`/`en`, Serwist ở production, 3D cho Hero/PDP                          | Offline còn tiếng Việt; WebGL là enhancement, không bảo đảm giao dịch offline |

Tắt mock không tự chuyển các flow chuyển tiếp sang API thật. Cách nối API nằm tại [API integration](../architecture/api-integration.md).

## Trải nghiệm và phạm vi

- Route nằm trong `src/app/[locale]`; code nghiệp vụ ở `src/modules`. Không suy ra URL từ tên module.
- Home gồm Hero, danh mục nổi bật, editorial, hàng mới về, lý do chọn cửa hàng và newsletter. Flash sale, bestseller, review cần dữ liệu thật trước khi bật.
- Catalog dùng Product → Variant → SKU; size/màu/giá/ảnh theo mapper API. Không suy diễn tồn kho, rating hoặc giảm giá từ fixture.
- Storefront không sở hữu back-office, database hoặc API nghiệp vụ. Backend kiểm authorization, ownership, giá và tồn kho; frontend guard phục vụ UX.
- Mô hình tích hợp hiện tại là một Store/một Warehouse, không dùng `X-Store-Id` và không gọi CMS từ Storefront.

Xem [kiến trúc](../architecture/README.md) để sửa code và [roadmap](../plan/roadmap.md) để biết việc tiếp theo. Hiện trạng này không phải chứng nhận sẵn sàng vận hành production.
