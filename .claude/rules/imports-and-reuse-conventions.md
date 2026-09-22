---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/**/*.{ts,tsx}'
---

# Convention import alias và tái sử dụng code

## Alias canonical

| Từ đâu       | Import tới đâu                               | Cách import                                    |
| ------------ | -------------------------------------------- | ---------------------------------------------- |
| `apps/*`     | File trong cùng app nhưng khác module/folder | `@/*` ánh xạ tới `./src/*`                     |
| `apps/*`     | Workspace package                            | Public subpath `@repo/<package>/<subpath>`     |
| `packages/*` | File cùng module/package                     | Relative `./...`                               |
| `packages/*` | Workspace package khác                       | Public subpath `@repo/<package>/<subpath>`     |
| Mọi nơi      | Dependency bên ngoài                         | Tên package (`react`, `@tanstack/react-query`) |

Ví dụ:

```ts
import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import type { Product } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';

import { ROUTES } from '@/shared/constants/routes';

import { ProductCard } from './ProductCard';
```

## Quy tắc chọn đường import

1. Cùng folder hoặc module con trực tiếp: dùng `./` để thể hiện cohesion cục bộ.
2. Khác module/folder trong cùng app: dùng `@/`; không đi ngược cây bằng `../`.
3. Qua package boundary: chỉ dùng subpath được khai báo trong `package.json#exports`.
4. Nếu subpath chưa tồn tại nhưng module cần public, thêm export có chủ đích vào package manifest; không deep import để né boundary.
5. Package không có alias `@/*`; không giả định alias app hoạt động bên trong package.

## Import bị cấm

```ts
// Parent-relative import
import { x } from '../../../shared/x';

// Deep import vào source private của package
import { Button } from '@repo/ui/src/components/Button';

// App import app khác
import { AdminShell } from '../../../admin/src/shell/AdminShell';

// Feature import implementation private của feature khác
import { internalMapper } from '@/features/orders/internal/mapper';

// Root barrel che dependency thật
import { Button, ProductSchema, getProducts } from '@repo/all';
```

- Không import `routeTree.gen.ts`, generated artifact hoặc test helper vào production code.
- Không dùng alias để che circular dependency hoặc ownership sai.
- Không tạo barrel `index.ts` mới. Public API của package dùng explicit subpath exports.
- Type-only dependency dùng `import type`; không biến type import thành runtime edge.

## Thứ tự import

Các nhóm cách nhau một dòng trống:

1. Runtime/framework và dependency bên ngoài.
2. Workspace package `@repo/*`.
3. App alias `@/*`.
4. Relative `./*` trong cùng module.
5. Side-effect import cuối cùng, chỉ khi thật sự cần.

ESLint là nguồn enforce cuối cùng cho thứ tự cụ thể. Không thêm comment để tắt `import-x/order`, `no-cycle` hoặc `no-relative-parent-imports` nếu chưa giải quyết nguyên nhân.

## Bắt buộc tìm khả năng tái sử dụng trước khi viết

Trước khi tạo component, hook, schema, endpoint, formatter, constant hoặc utility mới:

1. Dùng `rg` tìm theo domain noun, action verb, UI label và type tương tự.
2. Kiểm tra public exports của `@repo/ui`, `@repo/shared`, `@repo/schemas`, `@repo/api-sdk`.
3. Kiểm tra module dùng chung của app và feature lân cận.
4. Nếu đã có implementation cùng semantics, tái sử dụng hoặc mở rộng API hiện có thay vì viết bản sao.
5. Nếu phát hiện hai implementation cùng semantics trong phạm vi đang sửa, phải hợp nhất/extract phần chung trong cùng thay đổi khi an toàn.

Không được copy-paste rồi đổi tên biến, class CSS hoặc wording để tạo implementation mới có cùng hành vi.

## Vị trí đưa code dùng chung

| Loại trùng lặp                                                | Nơi đưa vào dùng chung                                |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| UI primitive không có business logic                          | `packages/ui`                                         |
| Component/hook/helper dùng bởi nhiều app, không phụ thuộc app | `packages/shared`                                     |
| Schema/transport type                                         | Domain tương ứng trong `packages/schemas`             |
| Endpoint/API transport                                        | `packages/api-sdk`                                    |
| Logic dùng bởi nhiều feature trong một app                    | `src/shared` hoặc `src/core` của app theo trách nhiệm |
| Logic dùng trong một route group Storefront                   | `_lib` của route group                                |
| Logic dùng trong một feature                                  | Giữ trong `features/<domain>`                         |
| Design token/theme                                            | `packages/tailwind-config` hoặc package token hiện có |

- Di chuyển abstraction lên scope chung nhỏ nhất chứa toàn bộ consumer; không đưa thẳng lên cross-app package nếu mới chỉ dùng trong một app.
- Khi public hóa module package, thêm explicit `package.json#exports` và test boundary liên quan.
- Tái sử dụng contract/behavior, không tái sử dụng bằng cách cho consumer import file private.

## Khi nào phải extract

Extract khi có từ hai implementation thỏa tất cả điều kiện:

- Cùng ý nghĩa nghiệp vụ hoặc cùng contract UI.
- Cùng input/output và failure semantics, hoặc có thể thống nhất mà không thêm cờ khó hiểu.
- Dự kiến thay đổi cùng một lý do.
- Abstraction chung làm giảm code và coupling tổng thể.

Ví dụ phải extract:

- Hai nơi tự format VND cùng quy tắc.
- Hai mutation cùng lặp logic chuyển `ApiError` thành một kiểu thông báo.
- Hai app dùng cùng một accessible empty/error state.
- Hai endpoint tự khai báo lại cùng response schema.
- Hai component có cùng markup, interaction và variants, chỉ khác dữ liệu/label truyền qua props.

## Khi nào được giữ riêng

Được giữ implementation riêng nếu giống cú pháp nhưng khác semantics hoặc khác lý do thay đổi, ví dụ:

- Validation checkout và validation chỉnh sửa profile hiện giống nhau nhưng thuộc rule nghiệp vụ khác.
- Trạng thái Order và Campaign có label/màu giống hiện tại nhưng lifecycle độc lập.
- Admin và Storefront có UX/accessibility contract khác nhau.
- Hai flow cần permission, error handling, analytics hoặc transaction boundary khác nhau.
- Việc hợp nhất buộc thêm nhiều boolean flag, union mơ hồ hoặc callback tùy biến làm API chung khó hiểu hơn code riêng.

Khi cố ý giữ duplicate:

- Ghi lý do trong handoff/PR summary.
- Nếu lý do không hiển nhiên và dễ bị “dọn” nhầm, thêm comment tiếng Việt ngắn tại boundary, nêu business rule khác nhau; không comment từng dòng duplicate.
- Không dùng câu “có thể khác trong tương lai” nếu chưa chỉ ra axis thay đổi cụ thể.

## Cấm abstraction sai

- Không tạo `utils.ts`, `helpers.ts`, `common.ts` hoặc `shared.ts` kiểu catch-all.
- Không tạo generic component với nhiều boolean prop chỉ để gộp hai UI khác semantics.
- Không tạo service/repository wrapper 1:1 quanh `@repo/api-sdk` mà không thêm boundary có giá trị.
- Không đưa business logic của một domain vào `packages/ui` hoặc generic shared hook.
- Không phá dependency direction để đạt “DRY”. Duplication nhỏ, độc lập tốt hơn abstraction khiến domain coupling sai.

## Quy tắc khi sửa code trùng lặp

1. Viết characterization test nếu hành vi cũ chưa được bảo vệ.
2. Xác định phần thực sự giống về semantics; để phần khác biệt ở consumer.
3. Extract pure core hoặc component contract nhỏ nhất.
4. Chuyển từng consumer sang abstraction chung.
5. Xóa implementation cũ và export không còn dùng.
6. Chạy test của tất cả consumer, lint, typecheck và kiểm tra import cycle.

Không để migration nửa vời với cả helper chung lẫn bản copy cũ cùng tồn tại nếu scope hiện tại cho phép hoàn tất an toàn.
