# Supporting Docs

File này giải thích phần tài liệu cũ còn lại dùng để làm gì.

Nếu bạn chỉ cần làm việc hằng ngày, hãy đọc:

- [`SRS.md`](./SRS.md)
- [`FE.md`](./FE.md)
- [`BE.md`](./BE.md)
- [`TEST.md`](./TEST.md)
- [`DEVOPS.md`](./DEVOPS.md)

Chỉ đọc file này khi bạn cần đào sâu hoặc truy nguồn.

## 1. `00-core/`

Đây là lớp nguồn gốc quan trọng nhất.

Dùng khi bạn cần:

- biết requirement gốc đã chốt là gì
- biết thuật ngữ domain chính xác là gì
- biết decision nào đã được chốt thật
- biết ADR nào đang giữ một quyết định kiến trúc quan trọng

Các file quan trọng nhất:

- `00-core/requirements/functional-requirements.md`
- `00-core/glossary.md`
- `00-core/decision-log.md`
- `00-core/adr/*`

## 2. `01-delivery/`

Đây là lớp tài liệu delivery chi tiết hơn.

Dùng khi bạn cần:

- xem traceability matrix chi tiết
- xem security baseline chi tiết
- xem spec chi tiết hơn 5 file chính
- xem các tài liệu planning hoặc implementation breakdown cũ

Các vùng đáng chú ý:

- `01-delivery/specification/`
- `01-delivery/traceability/`
- `01-delivery/security/`

## 3. `99-reference/`

Đây là lớp tham khảo.

Dùng khi bạn cần:

- hiểu bối cảnh brainstorming ban đầu
- xem research tham khảo
- tra lại các file plan/reference cũ

Không dùng lớp này để ghi đè requirement hoặc design hiện hành.

## 4. Quy tắc sử dụng đơn giản

- Cần build đúng scope: quay lại `SRS.md`
- Cần làm FE: quay lại `FE.md`
- Cần làm BE: quay lại `BE.md`
- Cần làm test: quay lại `TEST.md`
- Cần làm DevOps: quay lại `DEVOPS.md`
- Cần truy nguồn hoặc giải thích vì sao: mở `00-core/`
- Cần xem coverage chi tiết: mở `01-delivery/`
- Cần xem tham khảo cũ: mở `99-reference/`
