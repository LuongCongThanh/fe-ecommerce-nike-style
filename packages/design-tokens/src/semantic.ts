import { accent, error, info, neutral, secondary, success, warning } from './colors';

/**
 * Semantic color tokens — what components should reference. Maps to base
 * tokens (./colors); never hard-code a base token directly in shared UI.
 */

export const surface = {
  default: neutral[50],
  subtle: neutral[100],
  inverse: neutral[900],
  overlay: 'oklch(0.16 0.004 30 / 0.5)',
} as const;

export const text = {
  primary: neutral[900],
  secondary: neutral[700],
  muted: neutral[500],
  inverse: neutral[50],
  disabled: neutral[400],
} as const;

export const border = {
  default: neutral[200],
  subtle: neutral[100],
  strong: neutral[400],
  focus: secondary[500],
  danger: error[500],
} as const;

export const action = {
  primaryBg: neutral[900],
  primaryFg: neutral[50],
  primaryBgHover: neutral[800],
  secondaryBg: neutral[100],
  secondaryFg: neutral[900],
} as const;

export const feedback = {
  success: { bg: success[50], fg: success[700], border: success[500] },
  warning: { bg: warning[50], fg: warning[700], border: warning[500] },
  danger: { bg: error[50], fg: error[700], border: error[500] },
  info: { bg: info[50], fg: info[700], border: info[500] },
} as const;

/** Reserved for price/sale/promo badges — not a general action color. See colors.ts `brand`. */
export const accentHighlight = accent[500];
