# Storefront

Thuật ngữ nghiệp vụ dùng trong cửa hàng trực tuyến.

## Ngôn ngữ nghiệp vụ

### Trả hàng

**Đã ghi nhận yêu cầu trả hàng** (`RETURN_REQUESTED`)

Yêu cầu trả cả đơn của khách đã được ghi nhận. Nếu yêu cầu được duyệt, đơn vẫn ở trạng thái này cho đến khi việc trả hàng hoàn tất.

**Đã trả hàng** (`RETURNED`)

Cửa hàng đã nhận và kiểm tra đủ hàng của toàn bộ đơn. Tiến độ hoàn tiền, nếu có, được theo dõi riêng.

**Yêu cầu trả hàng bị từ chối**

Kết quả xử lý của một yêu cầu trả hàng. Đơn trở về trạng thái **Đã giao** (`DELIVERED`) và kết quả từ chối vẫn xuất hiện trong chi tiết đơn.

**Thời hạn yêu cầu trả hàng**

Bảy ngày tính từ lần giao đơn ban đầu. Trong thời hạn này, khách có thể gửi yêu cầu mới sau khi yêu cầu trước bị từ chối, với tối đa một yêu cầu đang xử lý cho mỗi đơn.
