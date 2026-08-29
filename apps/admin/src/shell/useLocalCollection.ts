import { useLocalStorage } from '@repo/shared/hooks/useLocalStorage';

export interface Identified {
  readonly id: string;
}

export interface LocalCollection<T extends Identified> {
  readonly items: T[];
  readonly add: (item: T) => void;
  readonly update: (id: string, next: T) => void;
  readonly patch: (id: string, changes: Partial<T>) => void;
  readonly remove: (id: string) => void;
  readonly removeMany: (ids: readonly string[]) => void;
  /**
   * Next free id of the form `${prefix}${n}`, derived from the ids already persisted rather than
   * from a module-level counter. A counter resets to its seed value on every reload and then hands
   * out ids that collide with rows already in `localStorage`; deriving from the data cannot.
   */
  readonly nextId: (prefix: string) => string;
}

/** Highest numeric suffix already used under `prefix`, or 0 when none is. */
function highestSuffix(items: readonly Identified[], prefix: string): number {
  let highest = 0;
  for (const { id } of items) {
    if (!id.startsWith(prefix)) continue;
    const suffix = Number(id.slice(prefix.length));
    if (Number.isInteger(suffix) && suffix > highest) highest = suffix;
  }
  return highest;
}

/**
 * A `localStorage`-persisted list of identified rows, seeded on first run. The demo features
 * (tasks, customers, apps) each owned their own copy of this — same key shape, same mutators, same
 * `useLocalStorage` call — differing only in the row type; this is that shape, once.
 *
 * Real, API-backed features do NOT use this: they go through `@repo/api-sdk` via their own
 * `useAdminX` query hooks.
 */
export function useLocalCollection<T extends Identified>(key: string, seed: T[]): LocalCollection<T> {
  const [items, setItems] = useLocalStorage<T[]>(key, seed);

  return {
    items,
    add: (item) => {
      setItems((prev) => [...prev, item]);
    },
    update: (id, next) => {
      setItems((prev) => prev.map((item) => (item.id === id ? next : item)));
    },
    patch: (id, changes) => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
    },
    remove: (id) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    removeMany: (ids) => {
      const idSet = new Set(ids);
      setItems((prev) => prev.filter((item) => !idSet.has(item.id)));
    },
    nextId: (prefix) => `${prefix}${String(highestSuffix(items, prefix) + 1)}`,
  };
}
