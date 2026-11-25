import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildImageUrl } from '@/shared/lib/cloudinary';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'testcloud');
});

describe('buildImageUrl', () => {
  it('returns placeholder for empty publicId', () => {
    expect(buildImageUrl('')).toBe('/images/placeholder.jpg');
  });

  it('uses an empty cloud name when the public cloud name is unset', () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    expect(buildImageUrl('products/shirt.jpg')).toBe('https://res.cloudinary.com//image/upload/f_auto,q_auto,c_fill/products/shirt.jpg');
  });

  it('builds URL with default transforms', () => {
    const url = buildImageUrl('products/shirt.jpg');
    expect(url).toBe('https://res.cloudinary.com/testcloud/image/upload/f_auto,q_auto,c_fill/products/shirt.jpg');
  });

  it('applies width when provided', () => {
    const url = buildImageUrl('products/shirt.jpg', { width: 400 });
    expect(url).toContain('w_400');
  });

  it('applies height when provided', () => {
    const url = buildImageUrl('products/shirt.jpg', { height: 300 });
    expect(url).toContain('h_300');
  });

  it('applies custom crop mode', () => {
    const url = buildImageUrl('products/shirt.jpg', { crop: 'thumb' });
    expect(url).toContain('c_thumb');
  });

  it('applies custom quality', () => {
    const url = buildImageUrl('products/shirt.jpg', { quality: 80 });
    expect(url).toContain('q_80');
  });

  it('preserves named quality presets', () => {
    const url = buildImageUrl('products/shirt.jpg', { quality: 'auto' });
    expect(url).toContain('q_auto');
  });

  it('does not include width/height when not provided', () => {
    const url = buildImageUrl('products/shirt.jpg');
    expect(url).not.toContain('w_');
    expect(url).not.toContain('h_');
  });
});
