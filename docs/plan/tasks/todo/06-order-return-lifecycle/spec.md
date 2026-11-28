---
status: todo
blocked-by: []
pr:
kind: ui
approved:
  files: []
  commands: []
retro-turns:
allow-test-changes:
---

# Spec 06: Vòng đời trả hàng toàn đơn

Branch: `feat/06-order-return-lifecycle`

## Problem Statement

Khách cần biết yêu cầu trả hàng đang được xử lý, đã bị từ chối hay đã hoàn tất. Mock hiện đánh dấu đơn `RETURNED` ngay khi duyệt. Khi yêu cầu bị từ chối, đơn trở về `DELIVERED` và chi tiết đơn chưa có dữ liệu để hiển thị kết quả từ chối.

## Solution

Storefront hiển thị trạng thái đơn và lịch sử yêu cầu trả hàng theo dữ liệu từ backend. Phạm vi đợt đầu là trả toàn bộ đơn. Việc hoàn tiền, nếu có, có tiến độ riêng.

## Acceptance criteria

- Khách có thể gửi yêu cầu trả cả đơn trong thời hạn 7 ngày tính từ lần giao ban đầu. Mỗi đơn có tối đa một yêu cầu đang xử lý. Gửi lại khi một yêu cầu đang xử lý không tạo yêu cầu thứ hai.
- Khi backend ghi nhận yêu cầu, đơn hiển thị `RETURN_REQUESTED`. Sau khi cửa hàng duyệt, đơn tiếp tục hiển thị trạng thái này trong khi chờ nhận và kiểm tra hàng.
- Đơn chỉ hiển thị `RETURNED` khi backend xác nhận đã nhận và kiểm tra đủ hàng. Khoản hoàn tiền đang xử lý không trì hoãn trạng thái này.
- Khi backend từ chối yêu cầu, đơn trở về `DELIVERED` và chi tiết đơn vẫn hiển thị kết quả từ chối.
- Sau khi bị từ chối, khách có thể gửi yêu cầu mới nếu vẫn trong thời hạn ban đầu. Yêu cầu mới không gia hạn mốc 7 ngày hoặc ghi đè kết quả từ chối trước đó. Hết hạn thì không thể gửi yêu cầu mới.
- Các nhãn và thông báo mới hiển thị đúng trên storefront ở cả `vi` và `en`.

## Kiểm thử dự kiến

- Kiểm tra hành vi ở màn hình chi tiết đơn với phản hồi API mô phỏng: ghi nhận, duyệt nhưng chưa nhận hàng, hoàn tất, từ chối và gửi lại.
- Kiểm tra trường hợp đã có yêu cầu đang xử lý và hai phía của mốc hết hạn. Dùng test vòng đời đơn hàng và test chi tiết đơn hiện có làm điểm bắt đầu.

## Ngoài phạm vi

- Trả một phần đơn hoặc chọn từng dòng hàng.
- Xây dựng quy trình hoàn tiền hoặc giao diện xử lý phía cửa hàng.

## Điều kiện trước khi giao triển khai

- Đối chiếu hợp đồng API với backend để xác nhận dữ liệu lịch sử yêu cầu, kết quả từ chối và tín hiệu xác nhận đã nhận đủ hàng.
- Nếu API tương ứng chưa có, thống nhất phạm vi dùng MSW theo [API integration](../../../../architecture/api-integration.md) trước khi triển khai. Task này chỉ ghi yêu cầu của storefront.
