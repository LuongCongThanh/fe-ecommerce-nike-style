# Metric

| Chỉ số                                                                   |               Trước |                             Sau |
| ------------------------------------------------------------------------ | ------------------: | ------------------------------: |
| Unit tests passing                                                       |                1167 |                            1200 |
| Test files                                                               |      85 (report 35) | 99 (cn, currency, +12 test mới) |
| Repo coverage (stmts/branches/funcs/lines)                               | 99.47/99.19/100/100 |             99.47/99.19/100/100 |
| Coverage tập file đã chuyển (stmts/branches/funcs/lines)                 | 64.68/59/49.2/63.43 |          97.41/89.93/98.4/97.32 |
| Source còn dưới `shared/ui`, `shared/lib/hooks`, `shared/lib/monitoring` |          31 + 2 + 1 |                               0 |
| Internal import edges checked                                            |                 697 |                             700 |

Cách đo coverage tập đã chuyển: `pnpm exec vitest run --coverage` với ngưỡng đặt 0 và `--coverage.include` = `src/shared/components/**`, `src/shared/{feedback,formatting,pagination,persistence,queries,styles,routing}/**`, `src/shared/monitoring/**` (v8, báo cáo ra thư mục tạm; không sửa `vitest.config.ts`). Đo lại trên checkout trước khi thêm test cho 65.51/59.74/49.6/64.28 (lệch nhỏ so với số ghi trước do tập include). Yêu cầu người dùng: ≥ 50% cả bốn chỉ số.

## Token (đo thật)

Chưa đo: `pnpm tokens` cần sessionId, không có trong phiên này.
