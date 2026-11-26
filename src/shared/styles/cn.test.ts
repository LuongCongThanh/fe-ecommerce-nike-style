import { describe, expect, it } from 'vitest';

import { cn } from '@/shared/styles/cn';

describe('cn', () => {
  it('merges tailwind classes, last wins on conflict', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('filters falsy values', () => {
    expect(cn('px-2', false, undefined, 'py-1')).toBe('px-2 py-1');
  });

  it('resolves padding conflict with arbitrary values', () => {
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('keeps opacity modifier distinct from base color', () => {
    expect(cn('bg-primary', 'bg-primary/50')).toBe('bg-primary/50');
  });

  it('handles Tailwind v4 arbitrary value classes without stripping', () => {
    const result = cn('bg-[oklch(70%_0.2_30)]', 'text-sm');
    expect(result).toContain('bg-[oklch(70%_0.2_30)]');
    expect(result).toContain('text-sm');
  });

  it('resolves conflicting arbitrary background values, last wins', () => {
    expect(cn('bg-[#ff0000]', 'bg-[#00ff00]')).toBe('bg-[#00ff00]');
  });

  it('accepts conditional class objects', () => {
    expect(cn({ 'text-bold': true, 'text-italic': false }, 'px-1')).toBe('text-bold px-1');
  });
});
