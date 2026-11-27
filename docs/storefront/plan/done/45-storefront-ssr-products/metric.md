# Metric

| Chỉ số                                     |    Trước |                 Sau |
| ------------------------------------------ | -------: | ------------------: |
| Unit tests passing                         | không đo |                1256 |
| Test files                                 | không đo |                 116 |
| Repo coverage (stmts/branches/funcs/lines) | không đo | 99.51/99.21/100/100 |
| Ngưỡng coverage toàn cục                   |       50 |                  50 |
| Known violation trong snapshot             |        0 |                   0 |

Cột "Trước" không đo lại trên `dev`; cột "Sau" đo thật trên nhánh này. Test mới: reader, mapper, query string, query policy, prefetch, `toSearchParams` (khoảng 40 test).

## Token (đo thật)

Chưa đo: `pnpm tokens` cần sessionId, không có trong phiên này.
