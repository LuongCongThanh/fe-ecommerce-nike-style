/**
 * Breakpoint scale (px) — Tailwind v4 defaults, not overridden. `md`/`lg`/`xl`
 * already matched Tailwind's defaults; `sm`/`2xl` were evaluated for a custom
 * override but kept default to avoid changing the ~32 existing `sm:` usages
 * across apps/storefront. See decision-log.md.
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/** Container max-width per breakpoint (storefront baseline, §16.4.3). admin/cms may go fluid instead. */
export const containerMaxWidth = {
  xs: '100%',
  sm: '100%',
  md: '720px',
  lg: '960px',
  xl: '1200px',
  '2xl': '1280px',
} as const;
