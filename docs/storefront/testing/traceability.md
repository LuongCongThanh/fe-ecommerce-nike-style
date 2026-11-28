# Traceability Storefront: luật → kịch bản → tầng

**Trạng thái:** thiết kế đã duyệt (2026-11-28). Luật gốc nằm trong Backend (`be-demo/docs/business/`: `03-user-stories.md`, `04-business-rules.md`, `05-order-lifecycle.md`). Tầng: **U** unit, **C** component, **I** integration, **E** E2E giao diện (dữ liệu giả), **P** E2E production, **J** E2E full-stack ở repo workspace.

Trạng thái test: `Not assessed` (đã có giao diện, chưa audit), `Chờ API thật` (đang chạy qua MSW), `Chờ Backend (task NN)`, `PASS` (có test và bằng chứng chạy).

| Mã         | Luật / US                    | Kịch bản                                                                                                | Tầng    | Mức | Trạng thái test       |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------- | ------- | --- | --------------------- |
| SF-CAT-01  | US-101, BR-CAT-15            | Danh mục hiện Sản phẩm của danh mục con cháu; danh mục ẩn trả trang 404                                 | I, P    | P1  | Not assessed          |
| SF-CAT-02  | US-102, BR-CAT-14            | Lọc size, màu, giá, giới tính và sắp xếp đồng bộ URL; reload và back/forward giữ bộ lọc                 | U, I, E | P1  | Not assessed          |
| SF-CAT-03  | US-103, BR-CAT-13            | Tìm kiếm debounce; từ khoá rỗng không lọc; request cũ không ghi đè kết quả mới                          | I       | P2  | Not assessed          |
| SF-CAT-04  | US-104, BR-CAT-05            | PDP: chọn màu đổi bộ ảnh; tổ hợp màu × size không tồn tại thì không chọn được                           | U, C    | P1  | Not assessed          |
| SF-CAT-05  | BR-CAT-08                    | Biến thể hết hàng: nhãn "Hết hàng", nút thêm giỏ disabled                                               | C, J0   | P1  | Not assessed          |
| SF-CAT-06  | BR-PRC-03                    | Giá áp dụng và giá gốc gạch ngang hiển thị đúng payload; định dạng VND                                  | U, C    | P1  | Not assessed          |
| SF-CAT-07  | SEO                          | Metadata, canonical, `hreflang`, structured data Product; sitemap chỉ có Sản phẩm `active`              | I, P    | P2  | Not assessed          |
| SF-CRT-01  | US-201, BR-CRT-05            | Stepper 1–10; Backend từ chối thì hiện lỗi và giữ số lượng cũ                                           | C       | P1  | Chờ API thật          |
| SF-CRT-02  | BR-CRT-04                    | Giá trong giỏ đổi: thông báo cho Người mua                                                              | C       | P1  | Chờ API thật          |
| SF-CRT-03  | US-202                       | Thêm, sửa, xoá làm mới giỏ (cache invalidation); bấm thêm hai lần nhanh không cộng hai lần ngoài ý muốn | I       | P1  | Chờ API thật          |
| SF-CRT-04  | US-203, US-204, BR-CRT-03    | Giỏ vãng lai còn sau reload; sau đăng nhập giỏ được gộp và hiển thị theo Backend                        | I, J4   | P1  | Chờ API thật          |
| SF-CHK-01  | US-303, BR-ORD-04            | Form địa chỉ 2 cấp: chọn tỉnh rồi phường/xã; thiếu trường thì focus lỗi đầu tiên                        | U, C    | P0  | Not assessed          |
| SF-CHK-02  | BR-ORD-07, US-308            | Backend từ chối vì khác Tính thử: hiện Tính thử mới, yêu cầu xác nhận lại                               | C, J2   | P0  | Chờ API thật          |
| SF-CHK-03  | Idempotency                  | Bấm đặt hai lần chỉ gửi một request; retry sau mạng lỗi dùng cùng idempotency key                       | C, J1   | P0  | Chờ API thật          |
| SF-CHK-04  | BR-INV-06, US-307            | Thiếu hàng: hiện Biến thể nào thiếu và còn bao nhiêu, cho sửa giỏ                                       | C, J2   | P0  | Chờ API thật          |
| SF-CHK-05  | US-304, BR-VCH-*             | Voucher không hợp lệ: hiện lý do Backend trả; hợp lệ: số giảm và Tổng tiền đúng payload                 | C, J3   | P0  | Chờ API thật          |
| SF-CHK-06  | BR-PAY-06                    | Vượt hạn mức COD: COD bị vô hiệu kèm lý do                                                              | C       | P0  | Chờ API thật          |
| SF-CHK-07  | BR-SHP-03                    | Miễn phí ship hiển thị theo payload; không tự suy ra từ ngưỡng ở client                                 | C       | P1  | Chờ API thật          |
| SF-CHK-08  | US-305, T2                   | Đặt COD thành công: trang xác nhận hiện Mã đơn; giỏ được làm trống                                      | C, J1   | P0  | Chờ API thật          |
| SF-PAY-01  | US-306, BR-PAY-01, BR-INV-05 | Chọn VNPay/MoMo, thử lại bằng Cổng khác; hiện thời gian còn lại; từ phút 7 không cho tạo link mới       | C, J6   | P0  | Chờ Backend (task 29) |
| SF-PAY-02  | BR-PAY-02                    | Trang Return URL chỉ đọc trạng thái từ Backend; chờ xác nhận thì hiện "đang xác nhận", không báo đã trả | C, J6   | P0  | Chờ Backend (task 29) |
| SF-ORD-01  | US-401, US-402               | Tra cứu đơn bằng Mã đơn + số điện thoại; sai thì báo không tìm thấy, không lộ đơn có tồn tại hay không  | C, J7   | P0  | Chờ Backend (task 30) |
| SF-ORD-02  | US-403, T5, T7               | Nút tự huỷ chỉ hiện khi trạng thái cho phép                                                             | C       | P1  | Chờ Backend (task 31) |
| SF-AUTH-01 | US-501, US-502               | Đăng ký, đăng nhập email hoặc Google; lỗi Backend vào đúng field; rate limit hiện thông báo             | C       | P0  | Chờ API thật          |
| SF-AUTH-02 | Phiên                        | Nhiều request cùng 401 → refresh một lần; refresh fail → đăng xuất, xoá dữ liệu riêng tư khỏi cache     | I       | P0  | Chờ API thật          |
| SF-AUTH-03 | US-503                       | Quên mật khẩu hiện cùng thông báo cho email có và không có Tài khoản                                    | C       | P0  | Chờ API thật          |
| SF-AUTH-04 | Route bảo vệ                 | Trang tài khoản, lịch sử đơn, sổ địa chỉ chuyển về đăng nhập khi chưa đăng nhập                         | I, E    | P0  | Not assessed          |
| SF-ACC-01  | US-504, US-506               | Sổ địa chỉ và hồ sơ: validate, lưu, lỗi                                                                 | C       | P2  | Chờ API thật          |
| SF-I18N-01 | US-505                       | Chuyển vi/en giữ route và bộ lọc; tên Sản phẩm luôn tiếng Việt; danh mục thiếu bản Anh dùng tiếng Việt  | U, I    | P2  | Not assessed          |
| SF-UI-01   | Chung                        | Mỗi trang dữ liệu: loading, rỗng, lỗi có nút thử lại; mạng chậm và ảnh lỗi không vỡ layout              | C       | P2  | Not assessed          |
| SF-UI-02   | Chung                        | Responsive mobile, tablet, desktop cho PDP, giỏ, checkout                                               | E       | P2  | Not assessed          |

## N/A

- Wishlist: ngoài API MVP (theo [tổng quan](../overview.md)); chỉ test client state hiện có, không vào traceability P0/P1.
- Review sản phẩm, flash sale, bestseller trên home: chưa có dữ liệu thật.
- Visual regression bằng dịch vụ ngoài: chưa có ngân sách.
