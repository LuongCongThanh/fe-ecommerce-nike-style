---
paths:
  - 'packages/schemas/**'
  - 'packages/api-sdk/**'
  - 'apps/**/*.{ts,tsx}'
  - 'packages/shared/**/*.{ts,tsx}'
description: Data-flow layering contract from component to Zod schema, plus TanStack Query/Zustand ownership rules.
---

# Contract, API and data conventions

## Required dependency flow

```text
Presentational component
  -> feature hook / view-model hook
    -> TanStack Query hook
      -> @repo/api-sdk endpoint
        -> apiClient
          -> Zod response schema
```

- Components do not call an endpoint, `apiClient`, `fetch` or Axios directly.
- Components do not parse a response, map a DTO, build a query key, invalidate cache, or classify an HTTP error.
- The API SDK does not import React, TanStack Query, the router, toast, or components.
- Query hooks do not render UI and do not return JSX.
- Mappers/selectors must be pure functions: no reading the store, router, global locale, or calling the network.
- Each layer only depends on the layer directly below it or a stable public contract; never reach across a boundary "for convenience".

## Layer responsibilities

| Layer                       | Allowed                                                                      | Not allowed                                            |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| `@repo/schemas`             | Validate the transport contract, infer the transport type                    | Call the API, hold UI state, format labels             |
| `@repo/api-sdk/endpoints`   | URL, method, params/body, response schema                                    | Query cache, toast, router, JSX                        |
| Feature query/mutation hook | Query key, queryFn, cache policy, invalidation                               | Render markup, read the DOM, hold layout               |
| Mapper/selector             | DTO -> domain/view model via a pure function                                 | Side effects, network calls, toast, mutating the cache |
| View-model/controller hook  | Combine query, mutation, URL/local state into a model + intents for the view | Contain JSX or styles                                  |
| Component                   | Render normalized state, accessibility, emit user intent                     | Know status codes, envelopes, cache keys, DTO parsing  |

## Structuring a feature with an API connection

Admin/CMS:

```text
features/products/
├── ProductList.tsx             # presentational view
├── ProductListPage.tsx         # composition/container, if needed
├── useAdminProducts.ts         # query + query keys
├── useProductMutations.ts      # mutations + invalidation
├── useProductListModel.ts      # URL/local state + view model for complex screens
├── product.mapper.ts           # DTO/domain -> view model, only when a meaningful transform exists
├── types.ts                    # feature-local view types
└── __tests__/
```

Storefront:

```text
(shop)/_lib/
├── api/                        # app-local wrapper, only when it adds a real app-specific contract
├── hooks/products/             # query/mutation/controller hooks
├── components/products/        # view components
├── utils/                      # pure mapper/selector/formatter
└── types/                      # view model types private to the route group
```

- Not every file is mandatory. Create a mapper/view-model/container only when that layer has a genuine responsibility.
- A simple query may be used directly inside a small container; components still never call the API directly.
- Do not create a `product.service.ts` that only re-calls one endpoint 1:1; the endpoint is already the data-access boundary.

## Reference implementation

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

`ProductList` does not know the endpoint, the response envelope, the query key, or the HTTP status. The container/controller hook turns technical state into props that are meaningful to the view.

## Data transformation rules

- Transport DTOs stay as-is in the schema/API layer. Only build a domain/view model when the UI clearly needs a different shape or semantics.
- Small transforms meant for one query consumer can use TanStack Query's `select`.
- Reused or business-rule-bearing transforms belong in a separate pure mapper/selector with a unit test.
- Pure presentational formatting like currency/date-by-locale happens at the view-model or a locale-aware formatter; never overwrite the transport value in the cache.
- Do not store JSX, translated labels, or formatted currency in the query cache.
- Do not mutate objects/arrays taken from a response. Use `map`, `filter`, object spread, or a pure selector.
- Do not store derived data in Zustand/local state if it can be computed stably from query data and UI state.

## Schema and contract

- Data that crosses the network must be described and parsed with Zod in `@repo/schemas`; do not just cast with `as` in the UI.
- Name schemas `<Domain>Schema`, request/response as `<Action>RequestSchema` and `<Action>ResponseSchema`; the inferred type drops the `Schema` suffix.
- Clearly distinguish nullable, optional and default per the transport contract; do not convert between them ad hoc in a component.
- Price and stock belong to the SKU in the current domain; Gender is a Product attribute/filter, not a Category.
- When a contract changes, update the schema, the inferred type, the endpoint, fixtures, the MSW handler and tests in the same vertical slice.

## API SDK

- Every application API call goes through a public subpath of `@repo/api-sdk`; components/hooks never call `fetch` or Axios directly.
- An endpoint must pass a response schema to the API client whenever there is a payload to validate.
- Normalize errors with `ApiError`; the UI does not infer an error shape from `unknown` itself.
- Do not put business logic or React state into the API SDK. Browser/server adapters only handle runtime/transport differences.
- Mock handlers must mirror the same URL, method, status, envelope and validation as the expected real API.

## TanStack Query and Zustand

- Query keys must be stable, serializable, and include every input that affects the response. A domain with many queries uses a `<domain>Keys` key factory.
- Query hooks are named `use<Domain>`/`use<Domain>List`; mutation hooks start with an action like `useCreate`, `useUpdate`, `useDelete`.
- After a mutation, invalidate or update the relevant keys precisely; do not clear the entire cache when a narrower scope suffices.
- Do not copy an API response from TanStack Query into Zustand. Zustand only holds shared client/UI state that is not server cache.
- Filter, sort and pagination state that needs to be deep-linkable/shareable must use the URL as its source of truth.
