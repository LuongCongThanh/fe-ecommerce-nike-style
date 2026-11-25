import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

function ServerValue(): React.JSX.Element {
  const [value] = useLocalStorage('server-value', 'server-default');
  return createElement('span', null, value);
}

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns the initial value when key is not set', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 42));

    expect(result.current[0]).toBe(42);
  });

  it('reads an existing value from localStorage on mount', () => {
    localStorage.setItem('user-pref', JSON.stringify('dark'));

    const { result } = renderHook(() => useLocalStorage('user-pref', 'light'));

    expect(result.current[0]).toBe('dark');
  });

  it('persists a new value to localStorage when setter is called', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));

    act(() => result.current[1](5));

    expect(result.current[0]).toBe(5);
    expect(JSON.parse(localStorage.getItem('count') ?? 'null')).toBe(5);
  });

  it('works with object values', () => {
    const { result } = renderHook(() => useLocalStorage<{ name: string }>('obj', { name: '' }));

    act(() => result.current[1]({ name: 'Thanh' }));

    expect(result.current[0].name).toBe('Thanh');
  });

  it('falls back to initial value when stored JSON is malformed', () => {
    localStorage.setItem('bad-json', 'NOT_JSON{{');

    const { result } = renderHook(() => useLocalStorage('bad-json', 'fallback'));

    expect(result.current[0]).toBe('fallback');
  });

  it('uses the initial value during server rendering', () => {
    vi.stubGlobal('window', undefined);

    expect(renderToString(createElement(ServerValue))).toContain('server-default');
  });

  it('keeps state usable when localStorage refuses to persist a value', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    const { result } = renderHook(() => useLocalStorage('full-storage', 'initial'));

    expect(() => act(() => result.current[1]('updated'))).not.toThrow();
    expect(result.current[0]).toBe('updated');
  });
});
