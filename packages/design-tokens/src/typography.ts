/**
 * Typography tokens. Font family is fixed (Be Vietnam Pro for body and
 * heading) — no per-locale override (ADR 0003).
 */

export const fontFamily = {
  sans: 'var(--font-be-vietnam-pro), sans-serif',
  mono: 'var(--font-mono), monospace',
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** size/lineHeight in px. Line-heights are sized generously for Vietnamese diacritics, especially uppercase. */
export const textStyles = {
  'body-sm': { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },
  'body-md': { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  'body-lg': { fontSize: 18, lineHeight: 28, fontWeight: fontWeight.regular },
  'label-sm': { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.medium },
  'label-md': { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.medium },
  'title-sm': { fontSize: 20, lineHeight: 28, fontWeight: fontWeight.semibold },
  'title-md': { fontSize: 24, lineHeight: 32, fontWeight: fontWeight.semibold },
  'title-lg': { fontSize: 30, lineHeight: 38, fontWeight: fontWeight.bold },
  'display-sm': { fontSize: 36, lineHeight: 44, fontWeight: fontWeight.bold },
} as const;
