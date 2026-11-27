# Kế hoạch quality gate tài liệu

Ngày thực hiện: 19/11/2026.

## Seam và phạm vi

Public seam là `pnpm docs:check` và hàm `checkDocs(root)`: trả exit khác 0/danh sách chẩn đoán khi checkout vi phạm contract. Gate chạy offline, không gọi backend hay mạng.

1. TDD link/anchor: hỗ trợ heading Unicode, slug trùng, URL encoding và reference-style link; bỏ code fence/inline code, external URL và sibling repo ngoài checkout.
2. TDD graph task: kiểm status/kind theo runtime, blocker tồn tại/không cycle, identity heading khi có và Wayfinder parent.
3. TDD live consumer: báo đường dẫn literal tới 10 tài liệu đã xóa trong file đang vận hành; loại hồ sơ task lịch sử và chính implementation/test của gate.
4. Kiểm Prettier cho bộ Markdown do repo sở hữu; loại task artifacts lịch sử và skill vendored.
5. Nối `docs:check` vào package script, CI và `verify-gates`; thêm command read-only vào guard mà không nới path/secret policy.
6. Cập nhật manual và report bằng kết quả kiểm tra thật.

## Rủi ro và giới hạn

- Gate kiểm tính toàn vẹn cấu trúc, không đánh giá tài liệu có đúng nghiệp vụ hay API thật hay không.
- Link external/sibling repo không được gọi mạng nên chỉ kiểm cú pháp/phân loại, không kiểm đích tồn tại.
- Task artifacts vẫn được kiểm link và graph nhưng không bị ép format lại, tránh biến hồ sơ lịch sử thành diff cơ học.
