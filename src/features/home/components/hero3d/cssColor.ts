import { Color, SRGBColorSpace } from 'three';

/**
 * Resolves a design-token custom property to a `THREE.Color`.
 *
 * The tokens in `@repo/tailwind-config` are authored in `oklch()`, which `THREE.Color` cannot parse
 * and which `getComputedStyle` hands back verbatim for custom properties. Painting the colour onto
 * a 1×1 canvas makes the browser itself do the conversion, so this keeps working for whatever
 * colour space the tokens move to next.
 *
 * Returns `fallback` when the token is missing or the browser refuses a 2D context.
 */
export function readTokenColor(token: string, fallback: string): Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  if (raw === '') return new Color(fallback);

  const probe = document.createElement('canvas');
  probe.width = 1;
  probe.height = 1;

  const ctx = probe.getContext('2d', { willReadFrequently: true });
  if (ctx === null) return new Color(fallback);

  ctx.fillStyle = raw;
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;

  return new Color().setRGB((pixel[0] ?? 0) / 255, (pixel[1] ?? 0) / 255, (pixel[2] ?? 0) / 255, SRGBColorSpace);
}
