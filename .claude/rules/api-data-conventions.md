---
paths:
  - 'packages/schemas/**'
  - 'packages/api-sdk/**'
  - 'apps/**/*.{ts,tsx}'
  - 'packages/shared/**/*.{ts,tsx}'
---

# Convention contract, API và dữ liệu

## Luồng phụ thuộc bắt buộc

```text
Presentational component
  -> feature hook / view-model hook
    -> TanStack Query hook
      -> @repo/api-sdk endpoint
        -> apiClient
          -> Zod response schema
```

- Component không gọi endpoint, `apiClient`, `fetch` hoặc Axios trực tiếp.
- Component không parse response, map DTO, tạo query key, invalidate cache hoặc phân loại HTTP error.
- API SDK không import React, TanStack Query, router, toast hoặc component.
- Query hook không render UI và không trả JSX.
- Mapper/selector phải là hàm thuần, không đọc store, router, locale toàn cục hoặc gọi network.
- Mỗi layer chỉ phụ thuộc layer ngay dưới hoặc public contract ổn định; không đi vòng qua boundary để “tiện”.

## Trách nhiệm từng layer

| Layer                       | Được làm                                                             | Không được làm                                     |
| --------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| `@repo/schemas`             | Validate transport contract, suy ra transport type                   | Gọi API, chứa UI state, format label               |
| `@repo/api-sdk/endpoints`   | URL, method, params/body, response schema                            | Query cache, toast, router, JSX                    |
| Feature query/mutation hook | Query key, queryFn, cache policy, invalidation                       | Render markup, đọc DOM, chứa layout                |
| Mapper/selector             | DTO -> domain/view model bằng hàm thuần                              | Side effect, network, toast, mutation cache        |
| View-model/controller hook  | Ghép query, mutation, URL/local state thành model và intent cho view | Chứa JSX hoặc style                                |
| Component                   | Render state đã chuẩn hóa, accessibility, phát user intent           | Biết status code, envelope, cache key, DTO parsing |

## Cấu trúc feature có kết nối API

Admin/CMS:

```text
features/products/
├── ProductList.tsx             # presentational view
├── ProductListPage.tsx         # composition/container nếu cần
├── useAdminProducts.ts         # query + query keys
├── useProductMutations.ts      # mutations + invalidation
├── useProductListModel.ts      # URL/local state + view model nếu màn hình phức tạp
├── product.mapper.ts           # DTO/domain -> view model, chỉ khi cần transform đáng kể
├── types.ts                    # feature-local view types
└── __tests__/
```

Storefront:

```text
(shop)/_lib/
├── api/                        # wrapper app-local chỉ khi thêm app-specific contract có giá trị
├── hooks/products/             # query/mutation/controller hooks
├── components/products/        # view components
├── utils/                      # pure mapper/selector/formatter
└── types/                      # view model type private của route group
```

- Không bắt buộc tạo đủ mọi file. Chỉ tạo mapper/view-model/container khi layer có trách nhiệm thực sự.
- Một query đơn giản có thể dùng trực tiếp trong container nhỏ; vẫn không gọi API trực tiếp từ presentational component.
- Không tạo file `product.service.ts` chỉ để gọi lại một endpoint 1:1; endpoint đã là data-access boundary.

## Mẫu triển khai

```ts
// packages/api-sdk/src/endpoints/catalog.ts
export function getProducts(query: ProductListRequest): Promise<ProductListResponse> {
  return apiClient.get('/api/products', query, { schema: ProductListResponseSchema });
}

// apps/admin/src/features/products/useAdminProducts.ts
export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  list: (query: ProductListRequest) => [...adminProductKeys.all, 'list', query] as const,
};

export function useAdminProducts(query: ProductListRequest) {
  return useQuery({
    queryKey: adminProductKeys.list(query),
    queryFn: () => getProducts(query),
    select: (response) => response.data,
  });
}

// apps/admin/src/features/products/ProductList.tsx
interface ProductListProps {
  readonly products: readonly Product[];
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly onRetry: () => void;
}
```

`ProductList` không biết endpoint, response envelope, query key hoặc HTTP status. Container/controller hook chuyển trạng thái kỹ thuật thành props có ý nghĩa với view.

## Quy tắc transform dữ liệu

- Transport DTO giữ nguyên trong schema/API layer. Chỉ tạo domain/view model khi UI cần shape hoặc semantics khác rõ ràng.
- Transform nhỏ, chỉ dành cho query consumer có thể dùng `select` của TanStack Query.
- Transform được dùng lại hoặc có business rule đặt trong pure mapper/selector riêng và có unit test.
- Format thuần trình bày như tiền/ngày theo locale thực hiện tại view-model hoặc formatter có locale input; không ghi đè giá trị transport trong cache.
- Không lưu JSX, translated label hoặc formatted currency trong query cache.
- Không mutate object/array lấy từ response. Dùng `map`, `filter`, object spread hoặc selector thuần.
- Derived data không lưu vào Zustand/local state nếu có thể tính ổn định từ query data và UI state.

## Schema và contract

- Dữ liệu đi qua network phải được mô tả và parse bằng Zod tại `@repo/schemas`; không chỉ ép kiểu bằng `as` ở UI.
- Đặt tên schema theo mẫu `<Domain>Schema`, request/response theo `<Action>RequestSchema` và `<Action>ResponseSchema`; type suy ra bỏ hậu tố `Schema`.
- Phân biệt rõ nullable, optional và default theo transport contract; không tự biến đổi giữa chúng trong component.
- Giá tiền và tồn kho thuộc SKU theo domain hiện tại; Gender là thuộc tính/filter của Product, không phải Category.
- Khi thay đổi contract, cập nhật schema, type suy ra, endpoint, fixture, MSW handler và test trong cùng vertical slice.

## API SDK

- Mọi lời gọi API của ứng dụng đi qua public subpath của `@repo/api-sdk`; component/hook không gọi `fetch` hoặc Axios trực tiếp.
- Endpoint phải truyền response schema vào API client khi có payload cần validate.
- Chuẩn hóa lỗi bằng `ApiError`; UI không tự suy luận error shape từ `unknown`.
- Không đưa business logic hoặc React state vào API SDK. Adapter browser/server chỉ xử lý khác biệt runtime/transport.
- Mock handler phải phản ánh cùng URL, method, status, envelope và validation như API thật dự kiến.

## TanStack Query và Zustand

- Query key phải ổn định, serializable và chứa toàn bộ input ảnh hưởng tới response. Domain có nhiều query dùng key factory `<domain>Keys`.
- Query hook đặt tên `use<Domain>`/`use<Domain>List`; mutation hook bắt đầu bằng hành động như `useCreate`, `useUpdate`, `useDelete`.
- Sau mutation, invalidate hoặc cập nhật đúng key liên quan; không xóa toàn bộ cache nếu phạm vi hẹp hơn đủ dùng.
- Không copy API response từ TanStack Query sang Zustand. Zustand chỉ giữ shared client/UI state không thuộc server cache.
- Filter, sort, pagination cần deep-link/share phải lấy URL làm source of truth.
