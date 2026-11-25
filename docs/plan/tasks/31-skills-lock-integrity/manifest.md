# Manifest phạm vi — Nguồn của skill

Snapshot tham chiếu ngày 25/11/2026, dựa trên spec hiện có. Rà lại đường dẫn, consumer và diff khi lập plan, đặc biệt sau các blocker. Danh sách này không phải approved.files và không cấp quyền sửa file; spec là nguồn chuẩn về phạm vi và điều kiện nghiệm thu.

## File và consumer cần đối chiếu

`skills-lock.json`, `.agents/skills/` (nguồn nội dung để đối chiếu).

## Kiểm tra và giới hạn

Kiểm tra từng entry thiếu commit, thuật toán hash version 2 và nguồn tại commit; ghi trường hợp không xác minh được.

## Giao nhau và bàn giao

Chỉ lockfile thuộc phạm vi sửa; không sửa skill hoặc mirror, cần nguồn mạng. Giữ status, identity và blocker hiện có; ghi phát hiện và kết quả thực tế vào report khi thực hiện.
