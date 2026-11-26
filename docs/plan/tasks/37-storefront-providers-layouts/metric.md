# Metric

| Chỉ số                                                          |                                                      Trước |                 Sau |
| --------------------------------------------------------------- | ---------------------------------------------------------: | ------------------: |
| Unit tests passing                                              |                                                       1200 |                1221 |
| Test files                                                      |                                                         99 |                 105 |
| Repo coverage (stmts/branches/funcs/lines)                      |                                        99.47/99.19/100/100 | 99.47/99.19/100/100 |
| Line coverage tập file task (providers + layouts)               | chưa đo (0 test cho layouts components/hook, query-client) |                86.2 |
| Source còn dưới `features/storefront-shell`, `app/_composition` |                                                      6 + 1 |                   0 |

Cách đo coverage tập file task: `pnpm exec vitest run src/providers src/layouts --coverage --coverage.include='src/providers/**' --coverage.include='src/layouts/**' --coverage.exclude='**/*.test.*' --coverage.thresholds.lines=0 --coverage.thresholds.functions=0 --coverage.thresholds.branches=0 --coverage.thresholds.statements=0 --coverage.reportsDirectory=<thư mục tạm>` (không sửa `vitest.config.ts`). Kết quả: stmts 86.17, branches 78.26, funcs 78.37, lines 86.2.

## Token (đo thật)

Chưa đo: `pnpm tokens` cần sessionId, không có trong phiên này.
