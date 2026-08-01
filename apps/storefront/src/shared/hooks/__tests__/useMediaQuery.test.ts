import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile, useIsDesktop, useIsTablet, useMediaQuery } from '@/shared/hooks/useMediaQuery';

type MatchMediaListener = (e: MediaQueryListEvent) => void;

function mockMatchMedia(matches: boolean) {
  const listeners: MatchMediaListener[] = [];
  const mql = {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_, cb: MatchMediaListener) => listeners.push(cb)),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    _listeners: listeners,
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return mql;
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when the media query does not match', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(result.current).toBe(false);
  });

  it('returns true when the media query matches', () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(result.current).toBe(true);
  });

  it('updates when a change event fires', () => {
    const mql = mockMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);

    act(() => {
      mql._listeners.forEach((fn) => fn({ matches: true } as unknown as MediaQueryListEvent));
    });

    expect(result.current).toBe(true);
  });
});

describe('useIsMobile', () => {
  it('returns false by default (matchMedia mock returns false)', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });
});

describe('useIsTablet', () => {
  it('returns false by default', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useIsTablet());

    expect(result.current).toBe(false);
  });
});

describe('useIsDesktop', () => {
  it('returns false by default', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(false);
  });
});
