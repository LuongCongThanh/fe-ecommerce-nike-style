/** Motion tokens — kept light, storefront-priority (per FE-ARCHITECTURE.md §16.2.1). */
export const easing = {
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const duration = {
  fast: 120,
  normal: 200,
  slow: 350,
} as const;
