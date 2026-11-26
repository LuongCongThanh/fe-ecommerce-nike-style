---
paths:
  - 'src/lib/schemas/**'
  - 'src/lib/api/**'
  - 'src/**/*.{ts,tsx}'
description: Data-flow layering contract from component to Zod schema, plus TanStack Query/Zustand ownership rules.
---

# Contract, API and data conventions

## Required dependency flow

```text
Presentational component
  -> feature hook / view-model hook
    -> TanStack Query hook
      -> src/lib/api endpoint
        -> apiClient
          -> pinned OpenAPI contract / transitional Zod schema
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
| `src/lib/schemas`           | Validate the transport contract, infer the transport type                    | Call the API, hold UI state, format labels             |
| `src/lib/api/endpoints`     | URL, method, params/body, response schema                                    | Query cache, toast, router, JSX                        |
| Feature query/mutation hook | Query key, queryFn, cache policy, invalidation                               | Render markup, read the DOM, hold layout               |
| Mapper/selector             | DTO -> domain/view model via a pure function                                 | Side effects, network calls, toast, mutating the cache |
| View-model/controller hook  | Combine query, mutation, URL/local state into a model + intents for the view | Contain JSX or styles                                  |
| Component                   | Render normalized state, accessibility, emit user intent                     | Know status codes, envelopes, cache keys, DTO parsing  |

## Structuring a feature with an API connection

```text
src/modules/catalog/
├── components/                 # Shared catalog views
├── hooks/                      # Listing/filter orchestration
├── queries/                    # Query keys, server cache and mutation policy
├── schemas/                    # Feature-owned input validation
├── product-list/components/    # List screen
├── product-detail/             # Detail screen, variant hooks and queries
├── catalogUrlState.ts          # Shared catalog URL rules
└── catalogUrlState.test.ts     # Colocated behavior test
```

- Not every file is mandatory. Create a mapper/view-model/container only when that layer has a genuine responsibility.
- A simple query may be used directly inside a small container; components still never call the API directly.
- Do not create a `product.service.ts` that only re-calls one endpoint 1:1; the endpoint is already the data-access boundary.

## Reference implementation

Read the actual contracts rather than copying a synthetic endpoint example:

- `src/lib/api/endpoints/catalog.ts`: endpoint/transport boundary.
- `src/modules/catalog/queries/catalogKeys.ts`: shared catalog cache keys.
- `src/modules/catalog/queries/useProducts.ts`: query/cache policy.
- `src/modules/catalog/hooks/useCatalogListing.ts`: URL and listing orchestration.
- `src/modules/catalog/product-list/components/ProductsClient.tsx`: screen composition.

Presentational children receive normalized state and callbacks. A container may connect query/controller hooks; it does not add another transport client.

## Data transformation rules

- Transport DTOs stay as-is in the schema/API layer. Only build a domain/view model when the UI clearly needs a different shape or semantics.
- Small transforms meant for one query consumer can use TanStack Query's `select`.
- Reused or business-rule-bearing transforms belong in a separate pure mapper/selector with a unit test.
- Pure presentational formatting like currency/date-by-locale happens at the view-model or a locale-aware formatter; never overwrite the transport value in the cache.
- Do not store JSX, translated labels, or formatted currency in the query cache.
- Do not mutate objects/arrays taken from a response. Use `map`, `filter`, object spread, or a pure selector.
- Do not store derived data in Zustand/local state if it can be computed stably from query data and UI state.

## Schema and contract

- Catalog uses generated types from the pinned OpenAPI contract and endpoint-owned mapping. Transitional endpoints keep existing Zod transport validation in `src/lib/schemas`. Do not force both representations onto one endpoint or cast unknown data in the UI.
- Name schemas `<Domain>Schema`, request/response as `<Action>RequestSchema` and `<Action>ResponseSchema`; the inferred type drops the `Schema` suffix.
- Clearly distinguish nullable, optional and default per the transport contract; do not convert between them ad hoc in a component.
- Price and stock belong to the SKU in the current domain; Gender is a Product attribute/filter, not a Category.
- When a contract changes, update the schema, the inferred type, the endpoint, fixtures, the MSW handler and tests in the same vertical slice.

## API SDK

- Every application API call goes through `src/lib/api`; components/hooks never call `fetch` or Axios directly.
- Preserve each endpoint's accepted contract/validation strategy. Endpoints using transitional schemas pass them to the API client; contract migrations update generated types and mapping together.
- Normalize errors with `ApiError`; the UI does not infer an error shape from `unknown` itself.
- Do not put business logic or React state into the API SDK. Browser/server adapters only handle runtime/transport differences.
- Mock handlers must mirror the same URL, method, status, envelope and validation as the expected real API.

## TanStack Query and Zustand

- Query keys must be stable, serializable, and include every input that affects the response. A domain with many queries uses a `<domain>Keys` key factory.
- Query hooks are named `use<Domain>`/`use<Domain>List`; mutation hooks start with an action like `useCreate`, `useUpdate`, `useDelete`.
- After a mutation, invalidate or update the relevant keys precisely; do not clear the entire cache when a narrower scope suffices.
- Do not copy an API response from TanStack Query into Zustand. Zustand only holds shared client/UI state that is not server cache.
- Filter, sort and pagination state that needs to be deep-linkable/shareable must use the URL as its source of truth.
