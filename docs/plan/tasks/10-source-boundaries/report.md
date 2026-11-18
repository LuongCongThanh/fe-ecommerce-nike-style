# Ranh giới source và kết quả refactor

## Quyết định

Query/mutation hook gọi endpoint SDK trực tiếp nếu service chỉ alias tên hàm. Giữ auth service vì chờ MSW và ghi session; giữ getOrderOrNull vì checkout-success cần fallback null khi ID trống hoặc request lỗi.

## Thay đổi

- Xóa ba service alias address/profile/reservation và object orderActions; cập nhật query và integration test gọi endpoint thật qua cùng transport/MSW.
- Giữ nguyên key, mutation callback, invalidation, payload, thông báo, request key và hành vi fallback.
- Chuyển LoginSchema vào feature auth; bỏ RegisterSchema/AuthTokenSchema cùng các type không có consumer. shared/types/user.ts chỉ còn type alias User được auth và account dùng chung.
- Chuyển schema form địa chỉ vào account; checkout dùng regex từ contract chung, không đi qua form địa chỉ.
- Xóa shared/types/filter.ts không có consumer và alias order; badge thuộc catalog/types/badge.ts.
- Chuyển PageShell thuần UI từ storefront-shell sang shared/ui; AppProviders về app/_composition; hook gộp giỏ/wishlist về storefront-shell vì đây là phối hợp nhiều nghiệp vụ.
- Cập nhật consumer và ghi chú cho task badge i18n / app-config, giữ trạng thái của chúng.

## Ranh giới được giữ

| Consumer         | Seam hiện có                                                              | Lý do                                               |
| ---------------- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| Storefront shell | Session hook, cart drawer/hooks, wishlist hook, catalog query/search hook | Shell phối hợp các feature cho navigation/header    |
| Checkout         | Cart hook/store, orderKeys                                                | Đặt đơn cần dữ liệu giỏ và invalidation lịch sử đơn |
| Home             | Catalog cards và queries                                                  | Cùng cách trình bày sản phẩm/danh mục               |
| Wishlist         | Cart hook, catalog variant/price functions                                | Resolve biến thể và chuyển item vào giỏ             |
| Catalog          | Wishlist hook                                                             | Thao tác lưu sản phẩm                               |

Các file nêu trên là seam có consumer thực tế; dùng import trực tiếp, không thêm barrel, không chuyển domain logic vào shared chỉ để tránh import giữa feature. Đây là kết luận cho consumer đã rà, không phải cho phép deep-import tùy ý. Chu trình ở mức tên feature catalog/wishlist không đủ chứng minh chu trình module: các consumer dùng những file khác nhau.

## Kiểm kê tĩnh

- Rà source TS/TSX ngoài test và generated, import tĩnh và dynamic import có literal alias.
- Không còn import đường dẫn source vừa xóa/chuyển.
- Không có đích alias bị thiếu trong phạm vi scan.
- Không có import @/features từ shared hoặc lib/api ở phạm vi production scan.
- ESLint boundaries hiện vẫn nhận diện route group và auth/session, chưa mô hình hóa mọi feature. Chuyển câu hỏi enforce sang ticket workflow; không tuyên bố lint hiện tại đã bảo vệ mọi seam.
- Phát hiện root và locale layout cùng mount AppProviders. Việc chuyển file giữ nguyên số lần mount; thêm ticket provider ownership để điều tra session/cache/locale trước khi thay đổi vòng đời.
- Scan không chứng minh URL động, dependency ngoài hoặc mọi cycle; không xóa public asset/MSW dựa vào kết quả này.

## Kiểm tra

- Bản cuối: pnpm lint, format:check, typecheck đều đạt.
- pnpm test: 76 file, 1044 test đạt sau khi chuyển module.
- Production build webpack: đạt sau khi chuyển file; ba sửa import-order tiếp theo không đổi hành vi.
- Prettier cho hồ sơ và tài liệu cấu trúc, git diff --check: đạt.
- Đích file của Markdown links trong docs/rules và tài liệu root: không thiếu; không kiểm tra URL ngoài/anchor.
- Không chạy E2E vì không đổi browser flow. GitHub Actions chưa chạy trên remote.
- Giữ cảnh báo middleware của Next.js và config loader của Vite; không sửa ngoài phạm vi.
- Chưa commit/push/PR. Không đóng map; các ticket workflow, tài liệu và provider ownership còn mở.
