# Report 02

- **PR:** #
- **Ngày merge:**

## Đã làm

- Thêm `src/features/orders/formatOrderDate.ts`: hàm thuần `formatOrderDate(iso, locale, { withTime?, timeZone? })` dùng `Intl.DateTimeFormat`. Map `vi -> vi-VN`, `en -> en-GB`; locale lạ (kể cả `''` hay khóa prototype như `toString`, kiểm bằng `Object.hasOwn`) rơi về `vi-VN`. `withTime` thêm giờ:phút 24h (`hourCycle: 'h23'`), không có giây. ISO không hợp lệ trả `''`. Không truyền `timeZone` thì dùng múi giờ trình duyệt.
- Thêm `src/features/orders/formatOrderDate.test.ts` (11 test, luôn truyền `timeZone: 'UTC'`): `vi`/`en` chỉ ngày và có giờ, locale lạ (`'fr'`, `''`, `'toString'`), không có giây/AM-PM, ISO sai (`'not-a-date'`, `''`).
- `OrdersClient.tsx`: `toLocaleDateString('vi-VN')` -> `formatOrderDate(order.created_at, locale)`.
- `OrderDetailClient.tsx`: `toLocaleString('vi-VN')` -> `formatOrderDate(order.created_at, locale, { withTime: true })`.

Định dạng đã chốt (kết quả chạy thật của Node trong repo, input `2024-03-05T14:07:09Z`, UTC):

| Locale | Chỉ ngày     | Có giờ              |
| ------ | ------------ | ------------------- |
| `vi`   | `05/03/2024` | `14:07 05/03/2024`  |
| `en`   | `05/03/2024` | `05/03/2024, 14:07` |

## Lệch so với spec và rủi ro còn lại

- Trang chi tiết đơn bỏ phần giây so với trước (`toLocaleString` cũ in cả giây): chủ ý theo spec.
- Phần ngày của `vi-VN` và `en-GB` giống nhau (`dd/MM/yyyy`); khác biệt thật nằm ở thứ tự ngày/giờ khi có giờ.
- Giá trị mong đợi trong test là chuỗi hard-code; với ICU của Node hiện tại không có lệch dấu phân cách/NBSP nên chưa cần phương án dự phòng so với `Intl.DateTimeFormat` tính trong test. Nếu bản Node/ICU khác trên CI đổi ký tự phân cách, test này sẽ báo đỏ và cần chuyển sang phương án dự phòng.
- Không truyền `timeZone` ở Client Component nên server/client có thể lệch múi giờ khi hydrate; giống hành vi cũ, không xử lý trong task này.
- Chuỗi tiếng Việt cứng khác ở hai màn hình (`Đơn #`, `Bạn chưa có đơn hàng nào.`...) vẫn còn, ngoài phạm vi.

## Test cũ đã chạm

Không. `OrdersClient.test.tsx` và `OrderDetailClient.test.tsx` chạy lại vẫn xanh, không sửa.

## Kiểm tra

- `pnpm exec vitest run src/features/orders/formatOrderDate.test.ts`: đỏ trước khi có implementation, xanh sau (11/11).
- `pnpm exec vitest run src/features/orders`: 4 file, 22 test xanh.
- `pnpm typecheck`: xanh.
- `pnpm lint`: xanh (đã sửa một lỗi `no-relative-import-paths` ở file test bằng import `@/features/orders/formatOrderDate`).
- `pnpm format:check`: xanh.
- `pnpm test`: 72 file, 899 test xanh.
- `pnpm build`: xanh.
- Grep `toLocale(Date)?String\(` trong `src/features/orders/**`: không còn kết quả.

## Acceptance criteria: chạy tay

- [x] `formatOrderDate` là hàm thuần; mọi nhánh (`vi`, `en`, locale lạ, `withTime`, ISO sai) có test.
- [x] Test luôn truyền `timeZone: 'UTC'`; giá trị mong đợi lấy từ lần chạy thật, định dạng chốt ghi trong comment của test.
- [x] Không còn `toLocaleString('vi-VN')` / `toLocaleDateString('vi-VN')` trong `src/features/orders/**`.
- [x] Test hiện có của `OrdersClient` và `OrderDetailClient` vẫn xanh, không sửa nội dung.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check` xanh (thêm `pnpm build` xanh).
- Chạy tay trên trình duyệt: chưa làm. Cách kiểm: mở `/vi/account/orders` và `/en/account/orders` (cùng trang chi tiết đơn) khi đã đăng nhập; trang `en` chi tiết hiện `dd/MM/yyyy, HH:mm`, trang `vi` hiện `HH:mm dd/MM/yyyy`, không có giây.

## Đề xuất cho môi trường

Phiên này dùng skill `mattpocock-skills:tdd`, `mattpocock-skills:writing-for-agents` (retro) và `mattpocock-skills:handoff` (gọi hai lần). Không dùng agent `explorer` (phạm vi đã rõ trong plan) và không dùng `fashion-storefront-ui-director` (task `kind: logic`). Các đề xuất, từ nặng đến nhẹ:

- **Rule mâu thuẫn với ESLint về import `./` (Coding standards, lỗi thật trong phiên).** `.claude/rules/core/imports-and-reuse.md:32` ghi "Same folder or direct submodule: use `./`", và ví dụ ở dòng 27 cùng `.claude/rules/core/typescript-react.md:69` đều dùng `./ProductCard`. Trong khi đó `eslint.config.mjs:237` đặt `no-relative-import-paths` với `allowSameFolder: false`. Làm theo rule, file test import `./formatOrderDate` và `pnpm lint` báo đỏ. Đề xuất: ESLint là nguồn sự thật, nên sửa hai file rule thành "mọi import nội bộ dùng `@/`" và đổi các ví dụ sang `@/...`. Phần thứ tự import chi tiết có thể rút gọn thành một pointer tới `eslint.config.mjs`, vì ESLint đã enforce.
- **Danh sách lệnh được phép không có trong prompt implementer (Information access).** Prompt viết "the bash allow-list above mirrors `allowCommands`", nhưng không hiện danh sách nào. Phiên này phí ba lời gọi bị guard chặn: `cd <dir> && …`, `… | tail -15` và `pnpm exec prettier --check <file.md>`. Đề xuất: `agent-run` chèn nội dung `allowCommands` vào prompt, hoặc ít nhất thêm một dòng "không dùng `cd`, pipe hay `pnpm exec prettier`; dùng đường dẫn tuyệt đối và công cụ Read/Grep".
- **`report.md` và các file task không được kiểm format (Automated checks).** Script `format:check` trong `package.json:13` chỉ quét `{src,e2e}/**` và file cấu hình ở root, còn lệnh `pnpm exec prettier --check` cho một file thì bị guard chặn. Vì vậy markdown do agent viết (`report.md`, `handoff.md`, `plan.md`) đi vào PR mà không ai kiểm, trừ khi `lint-staged` ở pre-commit bắt được. Đề xuất: thêm `"docs/**/*.md"` vào `format:check`, hoặc cho phép `pnpm exec prettier --check docs/storefront/plan/todo/**` trong `allowCommands`.
- **Rule về vị trí file test tự mâu thuẫn (Coding standards).** Bảng đặt tên ở `.claude/rules/core/typescript-react.md:32` ghi test nằm "under `__tests__`", cây thư mục ở `.claude/rules/data/api-data.md:53` cũng có `__tests__/`. Còn `AGENTS.md` và `.claude/rules/process/testing.md` ghi đặt test cạnh code, và repo đang làm vậy (ví dụ `OrdersClient.test.tsx`). Phiên này làm theo `AGENTS.md`, nhưng mâu thuẫn tốn thêm một lượt cân nhắc. Đề xuất: sửa hai chỗ đó thành "beside the source file" để chỉ còn một nguồn sự thật.
- **Skill TDD đòi xác nhận seam với người dùng, trong khi chạy không tương tác (Steering).** `mattpocock-skills:tdd` yêu cầu "confirm them with the user"; prompt implementer phải ghi đè bằng "do not ask the human to confirm them". Cách này vẫn chạy được nhưng hai chỉ dẫn ngược nhau cùng nằm trong context. Đề xuất: giữ câu ghi đè trong prompt, kèm lý do ngắn (seam đã được plan chốt ở mục "Seams kiểm thử"), để agent không coi đó là một ngoại lệ tùy hứng.
- **Kỹ thuật "chạy thật để lấy giá trị mong đợi" chạy tốt, nên ghi lại (Navigation/process).** Đặt giá trị mong đợi `'?'`, chạy test một lần rồi chép chuỗi từ thông báo lỗi giúp có giá trị thật từ ICU trong một lần chạy, không cần `node -e` (lệnh này cũng không có trong allow list). Có thể thêm một dòng vào `.claude/rules/process/testing.md`, mục Unit tests, cho các formatter phụ thuộc `Intl`.
- **Nhiễu lặp lại trong output (Tool economy).** Mỗi lần chạy `vitest` đều in cảnh báo `configLoader: 'native'` của Vite (do `vitest.config.ts` là ESM nhưng bị nạp như CommonJS). Hook design `impeccable` cũng chạy trên mỗi lần Edit file `.tsx` của một task `kind: logic`. Đề xuất: đổi tên thành `vitest.config.mts` hoặc đặt `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` trong script test, và chỉ bật hook `impeccable` khi spec có `kind: ui`.
- **Runner gọi `handoff` hai lần liên tiếp (Tool economy, nhẹ).** Lần thứ hai cho cùng một tài liệu. Đề xuất: `agent-run` bỏ qua bước handoff khi implementer đã trả `ok`, hoặc chỉ gọi một lần.
