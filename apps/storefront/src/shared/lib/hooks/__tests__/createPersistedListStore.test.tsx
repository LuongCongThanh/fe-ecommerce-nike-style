import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPersistedListStore } from '@/shared/lib/hooks/createPersistedListStore';

interface Item {
  id: string;
}

describe('createPersistedListStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads [] when nothing is persisted yet', () => {
    const store = createPersistedListStore<Item>('test-key', 1);
    expect(store.read()).toEqual([]);
  });

  it('round-trips items written and read back under the same version', () => {
    const store = createPersistedListStore<Item>('test-key', 1);
    store.write([{ id: 'a' }, { id: 'b' }]);
    expect(store.read()).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('treats a version mismatch as absent instead of trusting the stale shape', () => {
    const v1 = createPersistedListStore<Item>('test-key', 1);
    v1.write([{ id: 'a' }]);

    const v2 = createPersistedListStore<Item>('test-key', 2);
    expect(v2.read()).toEqual([]);
  });

  it('tolerates corrupt JSON instead of throwing', () => {
    localStorage.setItem('test-key', 'not json{');
    const store = createPersistedListStore<Item>('test-key', 1);
    expect(store.read()).toEqual([]);
  });

  it('runs onHydrate exactly once across multiple mounts of the same store', () => {
    const store = createPersistedListStore<Item>('test-key', 1);
    const onHydrate = vi.fn();

    renderHook(() => store.useHydrateOnce(onHydrate));
    renderHook(() => store.useHydrateOnce(onHydrate));
    renderHook(() => store.useHydrateOnce(onHydrate));

    expect(onHydrate).toHaveBeenCalledTimes(1);
  });

  it('keeps independent hydrate-once state per store instance', () => {
    const storeA = createPersistedListStore<Item>('key-a', 1);
    const storeB = createPersistedListStore<Item>('key-b', 1);
    const onHydrateA = vi.fn();
    const onHydrateB = vi.fn();

    renderHook(() => storeA.useHydrateOnce(onHydrateA));
    renderHook(() => storeB.useHydrateOnce(onHydrateB));

    expect(onHydrateA).toHaveBeenCalledTimes(1);
    expect(onHydrateB).toHaveBeenCalledTimes(1);
  });
});
