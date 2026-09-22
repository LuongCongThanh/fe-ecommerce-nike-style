---
paths:
  - 'apps/**'
  - 'packages/**'
---

# Convention cấu trúc thư mục và vị trí code

## Nguyên tắc quyết định

1. Code chỉ phục vụ một route/feature: giữ trong app và feature đó.
2. Code được dùng bởi nhiều feature trong cùng app: chuyển vào `src/shared` hoặc `src/core` của app theo trách nhiệm.
3. Code được dùng bởi từ hai app và không chứa business rule riêng app: cân nhắc package dùng chung.
4. UI thuần, không biết Product/Order/Customer: `packages/ui`.
5. Transport contract/validation: `packages/schemas`.
6. HTTP endpoint, runtime adapter, mock handler: `packages/api-sdk`.
7. Không tạo package/folder dùng chung chỉ vì “có thể sẽ reuse”; cần ít nhất hai consumer thực tế hoặc một boundary kiến trúc rõ ràng.

## Storefront

```text
apps/storefront/src/
├── app/                         # Next.js route, layout, loading, error, metadata
│   └── [locale]/
│       ├── (auth)/
│       │   ├── _lib/            # implementation private của route group auth
│       │   │   ├── api/
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   └── schemas/
│       │   └── <route>/
│       └── (shop)/
│           ├── _lib/            # implementation private của shop routes
│           │   ├── api/
│           │   ├── components/<domain>/
│           │   ├── constants/
│           │   ├── data/
│           │   ├── hooks/<domain>/
│           │   ├── schemas/
│           │   ├── types/
│           │   └── utils/
│           └── <route>/
├── core/                        # session/runtime concern cấp app
├── i18n/                        # cấu hình next-intl
├── lang/{vi,en}/                # message catalog
└── shared/                      # code dùng bởi nhiều route group trong Storefront
```

- Route folder dùng `kebab-case`; dynamic segment dùng `[param]`; route group dùng `(name)`.
- File convention của Next.js (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) chỉ điều phối route; chuyển UI/logic đáng kể vào `_lib`.
- `_lib` là private boundary của route group; không import từ route group không liên quan.
- Component theo domain nằm tại `components/<domain>`; hook gọi query/mutation nằm tại `hooks/<domain>`.

## Admin và CMS

```text
apps/<admin|cms>/src/
├── core/                 # runtime concern cấp app nếu có
├── features/<domain>/    # UI, hook, model và helper private của domain
├── i18n/                 # khởi tạo react-i18next
├── lang/{vi,en}/         # resource theo namespace
├── routes/               # file route TanStack Router, giữ mỏng
├── shell/                # app shell/navigation/layout dùng xuyên route
└── test/                 # test setup dùng chung
```

- File trong `routes/` ghép feature và route metadata; không đặt toàn bộ business/UI logic vào route file.
- Feature kết nối API tách query/mutation hook khỏi component; với màn hình phức tạp, dùng controller/view-model hook để component chỉ nhận render model và callback có ý nghĩa.
- Một feature không import implementation private của feature khác. Nếu thực sự dùng chung, chuyển abstraction nhỏ nhất lên `shell`, app-level shared hoặc package phù hợp.
- Không sửa `routeTree.gen.ts`; plugin TanStack Router chịu trách nhiệm sinh file.

## Shared packages

```text
packages/ui/src/{components,layout,hooks,lib}
packages/shared/src/{components,hooks,lib,providers,<cross-app-module>}
packages/schemas/src/<domain>/
packages/api-sdk/src/{client,endpoints,adapters,mocks,testing,env}
```

- Mỗi public module phải được khai báo bằng subpath trong `package.json#exports`.
- Không tạo root barrel `index.ts`. File `index.tsx` chỉ được giữ khi nó là public module có chủ đích đã tồn tại; không mở rộng pattern này.
- Package không import từ `apps/*`; `schemas` không import `api-sdk`; `ui` không import `shared`, schema hoặc domain code.
- Test đặt trong `__tests__` gần source. Fixture transport dùng lại đặt trong `api-sdk/src/mocks`; không nhúng fixture lớn trong component test.
