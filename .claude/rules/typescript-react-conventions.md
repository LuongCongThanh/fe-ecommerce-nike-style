---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/**/*.{ts,tsx}'
---

# Convention TypeScript và React

## TypeScript

- Tuân thủ strict mode; không dùng `any`, non-null assertion hoặc type assertion để che lỗi nếu có thể thu hẹp kiểu hay validate dữ liệu.
- Dùng `import type` cho import chỉ dùng ở vị trí type; giữ thứ tự import theo ESLint và không lặp import cùng module.
- Dùng `interface` cho object contract có khả năng mở rộng; dùng `type` cho union, mapped type, tuple hoặc type được suy ra/composed.
- Tên interface/type dùng `PascalCase`, không thêm tiền tố `I`. Props đặt theo mẫu `<Component>Props`.
- Không dùng TypeScript `enum`; dùng string union hoặc mảng/object `as const` rồi suy ra type.
- Constant toàn cục dùng `SCREAMING_SNAKE_CASE`; biến và hàm dùng `camelCase`; boolean bắt đầu bằng `is`, `has`, `can` hoặc `should`.
- Event prop bắt đầu bằng `on`; handler nội bộ bắt đầu bằng `handle`.
- Ưu tiên named export. Chỉ dùng default export khi framework hoặc file convention yêu cầu.
- Khai báo return type rõ ràng cho public API hoặc hàm có logic không hiển nhiên; không thêm annotation dư thừa cho biến local dễ suy ra.
- Comment/docblock mới viết bằng tiếng Việt, giải thích lý do, invariant hoặc rủi ro; không diễn giải lại điều code đã thể hiện rõ. Giữ nguyên tên domain và thuật ngữ kỹ thuật khi dịch làm sai nghĩa.

## Tên file và thư mục

| Loại                   | Convention                                  | Ví dụ                  |
| ---------------------- | ------------------------------------------- | ---------------------- |
| React component        | `PascalCase.tsx`                            | `ProductCard.tsx`      |
| React hook             | `useCamelCase.ts`/`.tsx`                    | `useAdminProducts.ts`  |
| Store                  | `<domain>.store.ts` hoặc pattern hiện có    | `cart.store.ts`        |
| Utility/adapter/config | `camelCase.ts`                              | `catalogUrlState.ts`   |
| Domain type tổng hợp   | `types.ts` trong feature hoặc `<domain>.ts` | `types.ts`, `order.ts` |
| Unit/integration test  | `<subject>.test.ts(x)` trong `__tests__`    | `catalog.test.ts`      |
| Playwright             | `<flow>.spec.ts`                            | `checkout.spec.ts`     |
| Route folder           | `kebab-case`                                | `forgot-password/`     |
| Dynamic route          | `[param]`                                   | `[slug]/`              |
| Constant               | `SCREAMING_SNAKE_CASE`                      | `ORDER_STATUS_OPTIONS` |
| Zod schema value       | `<Name>Schema`                              | `ProductSchema`        |
| Query key factory      | `<domain>Keys`                              | `adminProductKeys`     |

- Tên file phải phản ánh export chính; không dùng tên chung như `helpers.ts`, `common.ts`, `misc.ts` nếu trách nhiệm cụ thể hơn có thể đặt tên.
- File chỉ chứa type dùng chung trong một feature có thể là `types.ts`; type transport canonical phải nằm trong domain tương ứng của `packages/schemas`.
- Không đổi hàng loạt tên file legacy chỉ để đạt convention; áp dụng cho file mới và đổi tên khi đang sửa boundary liên quan.

## Tên biến và hàm

- Dùng danh từ cho dữ liệu (`product`, `orderItems`, `selectedSku`) và động từ cho hành động (`loadProducts`, `createOrder`, `formatPrice`).
- Collection dùng danh từ số nhiều; ID có hậu tố `Id`; mảng ID dùng `Ids`.
- Tránh viết tắt mơ hồ như `data1`, `tmp`, `obj`, `res`, `cb`. Tên ngắn (`i`, `e`) chỉ dùng trong scope rất nhỏ và quen thuộc; event handler ưu tiên `event`.
- Hàm trả boolean bắt đầu bằng `is`, `has`, `can` hoặc `should`; hàm tìm kiếm có thể dùng `find`; hàm chuyển đổi dùng `to*`, `from*`, `map*` hoặc tên domain rõ ràng.
- Hàm async gọi network dùng động từ domain (`getProducts`, `updateOrderStatus`), không dùng tên transport chung như `callApi`.
- Handler nội bộ dùng `handle<Action>`; callback prop dùng `on<Action>`; mutation hook dùng `use<Action><Entity>`.
- Không thêm `Async` vào tên chỉ vì hàm trả Promise; hành vi và return type đã thể hiện điều đó.

## Import

Thứ tự nhóm, ngăn bằng một dòng trống và để ESLint quyết định thứ tự trong nhóm:

```ts
import { useState } from 'react';
import type { FormEvent } from 'react';

import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import type { Product } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { useQuery } from '@tanstack/react-query';

import { ROUTES } from '@/shared/constants/routes';

import { ProductCard } from './ProductCard';
```

- Dùng public alias/subpath cho import xuyên boundary; relative import chỉ dành cho file cùng module hoặc module con.
- Không dùng parent-relative import (`../`) vì ESLint cấm. Nếu file hiện có dùng pattern cũ, không nhân rộng; dùng alias/public subpath phù hợp.
- Không import từ `@repo/<package>/src/*`, file private của feature khác hoặc `routeTree.gen.ts`.
- Không import cùng module nhiều lần nếu có thể gộp mà vẫn giữ `import type` đúng convention.
- Tránh circular dependency; nếu xuất hiện, xem lại ownership hoặc tách contract/type thuần xuống layer thấp hơn.

## React

- Component và file component dùng `PascalCase`; hook và file hook bắt đầu bằng `use`.
- Dùng function component và hook; không dùng class component.
- Giữ state ở phạm vi nhỏ nhất. Không đưa derived state vào `useState`; tính từ props/query/state gốc.
- Không dùng `useEffect` để đồng bộ dữ liệu có thể tính trong render hoặc xử lý trực tiếp trong event handler.
- Không tạo `QueryClient`, provider hoặc store mới bên trong feature khi app đã có provider/store chịu trách nhiệm.
- Props callback phải thể hiện ý nghĩa hành vi (`onSubmit`, `onRemove`), không đặt theo chi tiết UI (`onButtonClick`) nếu component không phụ thuộc loại control.
- Button HTML phải khai báo đúng `type`; hành động không submit mặc định dùng `type="button"`.
- Chỉ thêm `use client` ở ranh giới thực sự cần browser API, state, effect hoặc event handler; giữ Server Component làm mặc định trong Storefront khi có thể.
- Props được xem là readonly; không mutate object/array nhận từ props, query cache hoặc store.
- Key của list phải ổn định theo domain ID; không dùng array index nếu phần tử có thể thêm, xóa, sort hoặc reorder.
- Controlled form value phải có một source of truth. Form nhiều field/validation ưu tiên React Hook Form; không tự tạo nhiều state và validation trùng lặp khi form đã đủ phức tạp.
- `useMemo`/`useCallback` chỉ thêm khi identity là contract với child/effect hoặc profiling chỉ ra chi phí; không dùng mặc định cho mọi hàm/giá trị.
