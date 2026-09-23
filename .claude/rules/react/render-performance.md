---
paths:
  - 'apps/**/*.tsx'
  - 'apps/**/use*.ts'
  - 'apps/**/use*.tsx'
  - 'packages/ui/**/*.tsx'
  - 'packages/shared/**/*.tsx'
  - 'packages/shared/**/use*.ts'
description: React re-render control conventions — memoization discipline, state placement, Zustand/Context selectors.
---

# React re-render control conventions

The goal is to limit the scope of updates and remove unnecessary renders that have a real cost. A single re-render is not automatically a bug; do not add memoization before identifying the update source or the benefit.

## Order of operations

1. Identify which state, query, or context is changing.
2. Push the state down to the smallest component that actually needs it.
3. Narrow the subscription/selector so a component only tracks the data it uses.
4. Split static or expensive subtrees away from a frequently-updating component.
5. Stabilize object/function identity only when identity affects a child's `memo`, an effect, or an external library.
6. Verify before/after with the React DevTools Profiler for important screens.

## State and derived data

- Keep local interaction state close to where it is used; do not lift state to a page/context if siblings don't need it.
- Do not store derived state with `useState` + `useEffect`. Compute it directly during render; only use `useMemo` when the computation is genuinely expensive or identity is a contract.
- Do not keep the same data in the URL, the query cache, and Zustand at once. Pick one source of truth per the data-ownership convention.
- Use a functional state update when the next state depends on the previous one, to avoid unnecessary dependencies and stale closures.
- Combine state fields only when they always change together; split them when they have independent lifecycles or update frequencies.
- Avoid an effect that calls `setState` just to mirror props/query data; this pattern adds an extra render and risks the data drifting out of sync.

## TanStack Query

- A component should only subscribe to the query data/status it actually uses; split consumers if one part of the UI updates at a different frequency.
- Use `select` to fetch/transform the needed subset instead of letting components map/filter it repeatedly in multiple places.
- Query keys must be stable, serializable, and free of functions or values outside the real input.
- Do not copy a query result into local state or Zustand. A form edit is the deliberate exception: snapshot the initial data when the form opens and define clearly how refetches are handled.
- Keep structural sharing on by default; mappers/selectors must not mutate the response and should preserve unchanged references where practical.
- Do not pass an entire query result down to a presentational component if the view only needs a few fields and callbacks.

## Zustand and external stores

- Subscribe with the smallest selector: `useStore((state) => state.cart.items)`, not `useStore()` for the whole store.
- Do not return a new object/array from a selector on every call without proper equality; select individual fields or use shallow equality when several fields are needed.
- A store's actions must have a stable reference; do not re-wrap an action in an arrow function inside a selector unless necessary.
- Store state must be immutable; only create a new reference for the branch that actually changed.
- With `useSyncExternalStore`, `getSnapshot` must be cached/stable when data hasn't changed, and `subscribe` must clean up correctly.

## Context

- Do not use one large context for state that updates at different frequencies. Split contexts by lifecycle/responsibility, or use an external store with selectors.
- Memoize the Provider's `value` when the Provider re-renders often and consumers depend on reference identity; callbacks in the value must also be stable or separated from the state.
- Place a Provider at the narrowest scope that still avoids being recreated by unwanted navigation/render churn.
- Do not put frequently-changing server data into Context when TanStack Query already manages its subscription/cache.

## Props, callbacks and memoization

- Avoid creating a new object, array, or React element just to pass into an already-`memo`'d child; move static constants outside the component or memoize when identity truly needs to be stable.
- Do not use `useCallback` for every handler. Only use it when the callback is a dependency of an effect/custom hook, is passed to a memoized child, or a library requires stable identity.
- Do not use `useMemo` for cheap computations, simple literals, or "to make it faster" without a real consumer-identity need.
- Use `React.memo` for a pure component with meaningful render cost, props that usually don't change, and a parent that re-renders often. Do not memo a small component whose props are always new objects/functions.
- Keep props small and primitive where reasonable; do not pass an entire query/store/form object to a presentational component.
- Do not write a deep custom comparator for `memo` unless it is measurably cheaper than rendering and the props contract is stable.

## Effects and render loops

- The dependency array must be complete; do not disable the hooks rule to dodge a render loop.
- If an effect loops, fix the source identity or the state design; do not remove a correct dependency.
- Objects/functions used as dependencies must be created inside the effect, moved outside the component, or memoized with the minimal correct dependency set.
- Clean up timers, subscriptions, event listeners, observers and animation frames. Do not re-register on every render because of unstable callback identity.
- Effects only synchronize with an external system. Logic that follows directly from a user action belongs in the event handler.

## Lists, tables and forms

- Lists use a stable ID as key; never the index or a random key. A changing key remounts the item, loses its state, and increases render cost.
- For large lists/tables, keep column definitions stable; paginate or virtualize when DOM/render cost is significant.
- Split a row/item into its own component when each item has its own interaction/state, or the parent updates often; memoize only after verifying props are stable.
- Prefer React Hook Form's field-level subscriptions (`useWatch`, field state) over watching the whole form in the root component.
- Do not update ancestor state on every keystroke if only the input needs that value; debounce the side effect, not the controlled input value.

## Avoiding wrong optimizations

- React Strict Mode may render/run effects twice in development to surface side effects; do not treat that as a production re-render bug before verifying.
- Do not cache the wrong data or drop a dependency just to reduce renders.
- Do not make a component's API harder to read for a micro-optimization that hasn't been measured.
- Do not add a module-level singleton/mutable state just to dodge React rendering.
- A performance fix must state the cause, the scope of renders reduced, and how it was verified if the change is not obvious.

## Signals to flag during review

- A component subscribes to an entire store/context/query result but only uses one field.
- `setState` inside an effect to create derived state.
- A Provider's `value={{ ... }}` changes on every render across a large subtree.
- Query data copied into Zustand/local state.
- A list key using the index or a random value.
- `memo` paired with props that are always new objects/functions.
- Many `useMemo`/`useCallback` calls without a consumer-identity need or profiling evidence.
- A parent manages keystroke/hover state for a large subtree that doesn't need to know it.
