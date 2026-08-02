/** Elevation shadow scale (CSS box-shadow values). */
export const shadow = {
  sm: '0 1px 2px 0 oklch(0.16 0.004 30 / 0.06)',
  md: '0 4px 8px -2px oklch(0.16 0.004 30 / 0.1), 0 2px 4px -2px oklch(0.16 0.004 30 / 0.06)',
  lg: '0 12px 24px -4px oklch(0.16 0.004 30 / 0.12), 0 4px 8px -4px oklch(0.16 0.004 30 / 0.08)',
  xl: '0 24px 48px -8px oklch(0.16 0.004 30 / 0.18), 0 8px 16px -8px oklch(0.16 0.004 30 / 0.1)',
} as const;
