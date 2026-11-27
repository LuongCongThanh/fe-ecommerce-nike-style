# Kế hoạch audit source và cấu hình legacy

Ngày thực hiện: 18/11/2026.

## Phạm vi

- Đối chiếu các public asset scaffold với import, URL literal và convention Next.js.
- Truy ngược export mock catalog/order qua source, test, handler và script trước khi xóa.
- Giữ các fixture storefront và test helper còn consumer; không thay hành vi auth, middleware hoặc luồng mua hàng.
- Mở rộng lint boundary cho `shared`, API và schema mà không cấm seam feature hợp lệ.
- Sửa những comment còn mô tả cây source hoặc ownership đã bị xóa.

## Cách kiểm chứng

1. Tìm consumer bằng `rg` trên toàn checkout, rồi xác nhận bằng TypeScript và test tại seam API/mock.
2. Kiểm tra asset bằng cả tên file và đường dẫn `/...svg` để không bỏ sót URL động rõ ràng.
3. Chạy ESLint trên các file đổi; dùng probe tạm để chứng minh import ngược bị chặn và import hợp lệ vẫn qua.
4. Chạy test tập trung cho catalog, order, checkout, auth và API handler liên quan.

## Giới hạn

MSW và các fixture storefront đang phục vụ luồng chưa cutover vẫn được giữ. Role cookie, middleware và guard frontend vẫn có consumer nên không thuộc phạm vi xóa. Audit không triển khai API thật hay thay đổi domain return/order.
