# Báo cáo audit source và cấu hình legacy

Ngày hoàn tất: 18/11/2026.

## Kết quả

- Xóa năm SVG scaffold mặc định trong `public/` sau khi không tìm thấy import, URL literal, CSS reference hoặc convention runtime nào sử dụng chúng.
- Xóa các export mock chỉ phục vụ back-office đã bị loại khỏi storefront: CRUD/list catalog, CRUD category, truy cập order toàn cục, chuyển trạng thái order kiểu admin và duyệt/từ chối return kiểu admin.
- Xóa các helper kéo theo không còn consumer, gồm kiểm tra SKU được admin tham chiếu, reset CRUD, lọc/sort catalog và `releaseSkuStock`. Tìm kiếm toàn checkout xác nhận `releaseSkuStock` chỉ còn chính định nghĩa trước khi xóa.
- Giữ mock category/product seed, tìm SKU, commit/reset stock, account order, cancel/return request, idempotency và test helper vì handler hoặc test storefront còn dùng chúng.
- Giữ role cookie, `useAuth`, middleware và guard UX vì source hiện tại còn consumer. Không suy diễn guard frontend thành authorization backend.
- Mở rộng `import/no-restricted-paths` để `src/shared`, `src/lib/api` và `src/lib/schemas` không phụ thuộc ngược vào `src/app` hoặc `src/features`; feature vẫn được phép dùng seam API/schema.
- Sửa các comment còn trỏ vào tài liệu/cây module cũ, không đổi runtime behavior.

## Bằng chứng

- Scan consumer bao phủ source, test, scripts, CSS và cấu hình; scan tên/URL asset không tìm thấy consumer cho năm SVG bị xóa.
- Probe ESLint chặn ba chiều import ngược (shared/API/schema sang app/feature), đồng thời cho phép feature sang API và import nội bộ API.
- Focused test của implementer đầu: 23 file, 180 test pass; `typecheck` và scoped ESLint pass.
- Lượt hoàn tất: scoped ESLint không có error (CSS ngoài ESLint config được báo ignored), `pnpm typecheck` pass; 19 file/158 test catalog, order, checkout và schema pass sau khi xóa helper definition-only cuối cùng.

## Ngoài phạm vi

Chưa chuyển cart, wishlist, checkout hoặc order sang API thật; MSW tương ứng vẫn là runtime được hỗ trợ. Không đổi UI, auth contract, middleware, order lifecycle hoặc dữ liệu seed storefront.
