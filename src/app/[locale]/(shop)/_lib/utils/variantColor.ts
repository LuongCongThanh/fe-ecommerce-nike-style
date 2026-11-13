/** Maps the free-text `color` names used by mock SKUs (`packages/api-sdk/mocks/catalog-fixtures.ts`) to a hex value for the PDP 3D viewer material. */
const COLOR_HEX: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  grey: '#8a8a8a',
  gray: '#8a8a8a',
  charcoal: '#36454f',
  navy: '#1b2a4a',
  red: '#c62828',
  pink: '#ec7fa9',
  olive: '#6b7a3a',
  maroon: '#7b1e2b',
  blush: '#e8b4bc',
  yellow: '#f2c94c',
  blue: '#3b6bd6',
  sand: '#d8c3a0',
};

const DEFAULT_COLOR_HEX = '#9a9a9a';

/** Falls back to a neutral grey for products with no Color axis or an unrecognized color name. */
export function getVariantColorHex(color: string | null | undefined): string {
  if (color === null || color === undefined) return DEFAULT_COLOR_HEX;
  return COLOR_HEX[color.toLowerCase()] ?? DEFAULT_COLOR_HEX;
}
