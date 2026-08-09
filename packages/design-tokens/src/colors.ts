/**
 * Base color tokens — raw palette values. Components should prefer semantic
 * tokens (./semantic) over these; base tokens exist so semantic/component
 * layers have a single place to reference actual color values from.
 */

export const brand = {
  50: 'oklch(0.97 0.02 25)',
  100: 'oklch(0.93 0.05 25)',
  200: 'oklch(0.87 0.09 25)',
  300: 'oklch(0.79 0.14 25)',
  400: 'oklch(0.7 0.19 25)',
  500: 'oklch(0.62 0.23 25)',
  600: 'oklch(0.54 0.22 25)',
  700: 'oklch(0.45 0.19 25)',
  800: 'oklch(0.35 0.15 25)',
  900: 'oklch(0.26 0.1 25)',
  950: 'oklch(0.16 0.06 25)',
} as const;

export const secondary = {
  50: 'oklch(0.97 0.02 220)',
  100: 'oklch(0.93 0.04 220)',
  200: 'oklch(0.87 0.08 220)',
  300: 'oklch(0.78 0.13 220)',
  400: 'oklch(0.68 0.17 220)',
  500: 'oklch(0.57 0.2 220)',
  600: 'oklch(0.48 0.18 220)',
  700: 'oklch(0.39 0.15 220)',
  800: 'oklch(0.3 0.11 220)',
  900: 'oklch(0.22 0.07 220)',
  950: 'oklch(0.14 0.04 220)',
} as const;

export const accent = {
  50: 'oklch(0.98 0.02 55)',
  100: 'oklch(0.95 0.05 55)',
  200: 'oklch(0.9 0.1 55)',
  300: 'oklch(0.84 0.15 55)',
  400: 'oklch(0.78 0.19 55)',
  500: 'oklch(0.72 0.22 55)',
  600: 'oklch(0.63 0.2 55)',
  700: 'oklch(0.53 0.17 55)',
  800: 'oklch(0.42 0.13 55)',
  900: 'oklch(0.31 0.09 55)',
  950: 'oklch(0.2 0.05 55)',
} as const;

/** 50/900/950 chroma nudged to >=0.005 (homepage-improvement-plan.md P2-5) — kept in sync with
 * packages/tailwind-config/src/theme.css's --color-neutral-* values. */
export const neutral = {
  50: 'oklch(0.98 0.006 30)',
  100: 'oklch(0.96 0.006 30)',
  200: 'oklch(0.92 0.008 30)',
  300: 'oklch(0.85 0.01 30)',
  400: 'oklch(0.72 0.01 30)',
  500: 'oklch(0.58 0.01 30)',
  600: 'oklch(0.45 0.008 30)',
  700: 'oklch(0.35 0.007 30)',
  800: 'oklch(0.25 0.006 30)',
  900: 'oklch(0.16 0.006 30)',
  950: 'oklch(0.1 0.005 30)',
} as const;

/** warning-500 is for backgrounds/icons only — use warning-700 for text (WCAG AA). */
export const warning = {
  50: 'oklch(0.98 0.03 80)',
  500: 'oklch(0.78 0.18 80)',
  700: 'oklch(0.52 0.16 80)',
} as const;

export const success = {
  50: 'oklch(0.97 0.03 145)',
  500: 'oklch(0.6 0.18 145)',
  700: 'oklch(0.42 0.14 145)',
} as const;

/** Semantic "danger" maps to this base family — kept as `error` since components already reference `error-*` utility classes. */
export const error = {
  50: 'oklch(0.97 0.02 10)',
  500: 'oklch(0.58 0.24 10)',
  700: 'oklch(0.42 0.2 10)',
} as const;

export const info = {
  50: 'oklch(0.97 0.02 250)',
  500: 'oklch(0.58 0.18 250)',
  700: 'oklch(0.42 0.15 250)',
} as const;
