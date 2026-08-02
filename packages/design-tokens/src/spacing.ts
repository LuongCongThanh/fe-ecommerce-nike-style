/**
 * Spacing scale (px) — 4px base grid, matches Tailwind's default scale.
 * Kept here so non-Tailwind JS consumers (e.g. inline style math) use the
 * same numbers instead of inventing their own.
 */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;
