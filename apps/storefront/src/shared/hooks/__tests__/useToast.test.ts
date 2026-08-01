import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { mockNotify } = vi.hoisted(() => ({
  mockNotify: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock('@/shared/lib/notification', () => ({
  notify: mockNotify,
}));

import { useToast } from '@/shared/hooks/useToast';

describe('useToast', () => {
  it('returns the shared notification helpers', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current).toBe(mockNotify);
  });
});
