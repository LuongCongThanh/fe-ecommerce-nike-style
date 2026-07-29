# FE Docs

Từ giờ, hãy coi **5 file dưới đây là bộ tài liệu chính**:

1. [`SRS.md`](./SRS.md)
2. [`FE/README.md`](./FE/README.md)
3. [`BE.md`](./BE.md)
4. [`TEST.md`](./TEST.md)
5. [`DEVOPS.md`](./DEVOPS.md)

Nếu bạn mới vào dự án, chỉ cần đọc 5 file này trước.

## Đường đọc ngắn nhất

- Mới vào dự án: `SRS.md` -> `FE/README.md` -> `BE.md` -> `TEST.md` -> `DEVOPS.md`
- Chỉ làm FE: `SRS.md` -> `FE/README.md` -> `TEST.md`
- Chỉ làm BE: `SRS.md` -> `BE.md` -> `TEST.md` -> `DEVOPS.md`
- Chỉ làm test: `SRS.md` -> `TEST.md`

## Nếu cần đào sâu

Xem thêm [`SUPPORTING-DOCS.md`](./SUPPORTING-DOCS.md).

File đó giải thích:

- `00-core/` dùng khi nào
- `01-delivery/` dùng khi nào
- `99-reference/` dùng khi nào

## Thứ tự ưu tiên khi có mâu thuẫn

1. `00-core/requirements/functional-requirements.md`
2. `00-core/glossary.md`
3. `00-core/adr/`
4. `00-core/decision-log.md`
5. `SRS.md`
6. `FE/FE.md`
7. `BE.md`
8. `TEST.md`
9. `DEVOPS.md`

## Trạng thái thực tế của repo

Tính đến Thứ Tư, ngày 29 tháng 7 năm 2026:

- repo vẫn chủ yếu là tài liệu
- chưa có scaffold code thật cho `apps/*` và `packages/*`
- vì vậy các tài liệu `FE`, `BE`, `TEST`, `DEVOPS` hiện là tài liệu định hướng triển khai, chưa phải tài liệu của codebase đã tồn tại
