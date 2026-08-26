import { describe, expect, it } from 'vitest';

import { canCancelOrder, canRequestReturn, isWithinReturnWindow, RETURN_WINDOW_MS } from '../order-transitions';

describe('canCancelOrder', () => {
  it.each(['PENDING', 'PROCESSING'] as const)('allows cancel from %s', (status) => {
    expect(canCancelOrder({ status })).toBe(true);
  });

  it.each(['PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'] as const)('refuses cancel from %s', (status) => {
    expect(canCancelOrder({ status })).toBe(false);
  });
});

describe('canRequestReturn', () => {
  it('refuses when the order was never DELIVERED', () => {
    expect(canRequestReturn({ status: 'PROCESSING', delivered_at: null })).toBe(false);
  });

  it('refuses DELIVERED with no delivered_at (shouldn’t happen, but no false-allow either)', () => {
    expect(canRequestReturn({ status: 'DELIVERED', delivered_at: null })).toBe(false);
  });

  it('allows within the 7-day window', () => {
    const now = Date.parse('2026-01-08T00:00:00.000Z');
    const deliveredAt = '2026-01-01T00:00:00.000Z';
    expect(canRequestReturn({ status: 'DELIVERED', delivered_at: deliveredAt }, now)).toBe(true);
  });

  it('refuses once the 7-day window has passed', () => {
    const now = Date.parse('2026-01-09T00:00:00.001Z');
    const deliveredAt = '2026-01-01T00:00:00.000Z';
    expect(canRequestReturn({ status: 'DELIVERED', delivered_at: deliveredAt }, now)).toBe(false);
  });
});

describe('isWithinReturnWindow — the seam canRequestReturn and the mock server both go through', () => {
  it('is exactly RETURN_WINDOW_MS wide', () => {
    const deliveredAt = '2026-01-01T00:00:00.000Z';
    const edge = Date.parse(deliveredAt) + RETURN_WINDOW_MS;
    expect(isWithinReturnWindow(deliveredAt, edge)).toBe(true);
    expect(isWithinReturnWindow(deliveredAt, edge + 1)).toBe(false);
  });
});
