import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCanRender3D } from '@/shared/hooks/useCanRender3D';

interface MediaState {
  readonly reducedMotion?: boolean;
  readonly coarsePointer?: boolean;
}

function mockMedia({ reducedMotion = false, coarsePointer = false }: MediaState = {}): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : coarsePointer,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

interface NavState {
  readonly connection?: { saveData?: boolean; effectiveType?: string };
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: unknown;
}

function mockNavigator({ connection, deviceMemory = 8, hardwareConcurrency = 8 }: NavState = {}): void {
  vi.stubGlobal('navigator', { connection, deviceMemory, hardwareConcurrency });
}

/** `null` = driver refused the context, `'throw'` = `getContext` itself blew up. */
function mockWebGL2(result: 'ok' | 'null' | 'throw'): void {
  const context: RenderingContext = { canvas: document.createElement('canvas') } as unknown as RenderingContext;

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
    if (result === 'throw') throw new Error('context creation failed');
    return result === 'ok' ? context : null;
  });
}

/** Replaces `requestIdleCallback` with a manual trigger so idle scheduling is observable. */
function mockIdleCallback(): { flush: () => void; cancel: ReturnType<typeof vi.fn> } {
  let queued: (() => void) | undefined;
  const cancel = vi.fn();

  vi.stubGlobal('requestIdleCallback', (callback: () => void) => {
    queued = callback;
    return 1;
  });
  vi.stubGlobal('cancelIdleCallback', cancel);

  return {
    flush: () => {
      act(() => {
        queued?.();
      });
    },
    cancel,
  };
}

describe('useCanRender3D', () => {
  beforeEach(() => {
    mockMedia();
    mockNavigator();
    mockWebGL2('ok');
    vi.stubGlobal('innerWidth', 1440);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts pending before any gate has resolved', () => {
    mockIdleCallback();

    const { result } = renderHook(() => useCanRender3D());

    expect(result.current).toEqual({ status: 'pending', tier: 'full' });
  });

  it('reaches ready on an unconstrained desktop once the idle slot fires', () => {
    const idle = mockIdleCallback();
    const { result } = renderHook(() => useCanRender3D());

    idle.flush();

    expect(result.current).toEqual({ status: 'ready', tier: 'full' });
  });

  describe('terminal gates', () => {
    it.each([
      ['prefers-reduced-motion', () => mockMedia({ reducedMotion: true })],
      ['Save-Data', () => mockNavigator({ connection: { saveData: true } })],
      ['slow-2g', () => mockNavigator({ connection: { effectiveType: 'slow-2g' } })],
      ['2g', () => mockNavigator({ connection: { effectiveType: '2g' } })],
      ['low device memory', () => mockNavigator({ deviceMemory: 2 })],
      ['few logical cores', () => mockNavigator({ hardwareConcurrency: 2 })],
      ['no WebGL2 context', () => mockWebGL2('null')],
      ['WebGL2 probe throwing', () => mockWebGL2('throw')],
    ])('turns off for %s', (_label, applyGate) => {
      const idle = mockIdleCallback();
      applyGate();

      const { result } = renderHook(() => useCanRender3D());
      expect(result.current.status).toBe('pending');

      idle.flush();

      expect(result.current).toEqual({ status: 'off', tier: 'full' });
    });
  });

  describe('gates that must not fire', () => {
    it.each([
      ['a fast connection', () => mockNavigator({ connection: { effectiveType: '4g' } })],
      ['no Network Information API', () => mockNavigator({ connection: undefined })],
      ['ample device memory', () => mockNavigator({ deviceMemory: 8 })],
      ['an unreported core count', () => mockNavigator({ hardwareConcurrency: undefined })],
    ])('still reaches ready with %s', (_label, applyEnvironment) => {
      const idle = mockIdleCallback();
      applyEnvironment();

      const { result } = renderHook(() => useCanRender3D());
      idle.flush();

      expect(result.current.status).toBe('ready');
    });
  });

  describe('tier', () => {
    it('is lite on a coarse pointer even at desktop width', () => {
      mockMedia({ coarsePointer: true });
      const idle = mockIdleCallback();

      const { result } = renderHook(() => useCanRender3D());
      idle.flush();

      expect(result.current).toEqual({ status: 'ready', tier: 'lite' });
    });

    it('is lite on a narrow viewport', () => {
      vi.stubGlobal('innerWidth', 720);
      const idle = mockIdleCallback();

      const { result } = renderHook(() => useCanRender3D());
      idle.flush();

      expect(result.current.tier).toBe('lite');
    });
  });

  describe('idle scheduling', () => {
    it('cancels a pending idle callback on unmount', () => {
      const idle = mockIdleCallback();

      const { unmount } = renderHook(() => useCanRender3D());
      unmount();

      expect(idle.cancel).toHaveBeenCalledWith(1);
    });

    it('falls back to a timeout where requestIdleCallback is unavailable', () => {
      vi.useFakeTimers();
      vi.stubGlobal('requestIdleCallback', undefined);

      const { result } = renderHook(() => useCanRender3D());
      expect(result.current.status).toBe('pending');

      act(() => {
        vi.advanceTimersByTime(2_000);
      });

      expect(result.current.status).toBe('ready');
      vi.useRealTimers();
    });

    it('clears the fallback timeout on unmount', () => {
      vi.useFakeTimers();
      vi.stubGlobal('requestIdleCallback', undefined);
      const clearSpy = vi.spyOn(window, 'clearTimeout');

      const { unmount } = renderHook(() => useCanRender3D());
      unmount();

      expect(clearSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
