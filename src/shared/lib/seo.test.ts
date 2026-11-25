import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildMetadata } from '@/shared/lib/seo';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_APP_NAME', 'TestShop');
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://testshop.com');
});

describe('buildMetadata', () => {
  it('formats title with site name', () => {
    const meta = buildMetadata({ title: 'Áo thun' });
    expect(meta.title).toBe('Áo thun | TestShop');
  });

  it('includes description when provided', () => {
    const meta = buildMetadata({ title: 'Áo thun', description: 'Mô tả sản phẩm' });
    expect(meta.description).toBe('Mô tả sản phẩm');
  });

  it('sets canonical URL when url provided', () => {
    const meta = buildMetadata({ title: 'Catalog', url: '/catalog' });
    expect(meta.alternates?.canonical).toBe('https://testshop.com/catalog');
  });

  it('sets openGraph title', () => {
    const meta = buildMetadata({ title: 'Áo thun' });
    const og = meta.openGraph as Record<string, unknown>;
    expect(og?.title).toBe('Áo thun | TestShop');
  });

  it('includes OG image when provided', () => {
    const meta = buildMetadata({ title: 'Áo thun', image: 'https://img.com/shirt.jpg' });
    const og = meta.openGraph as Record<string, unknown>;
    expect(og?.images).toBeDefined();
  });

  it('sets noIndex robots when noIndex is true', () => {
    const meta = buildMetadata({ title: 'Admin', noIndex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('does not set robots when noIndex is false', () => {
    const meta = buildMetadata({ title: 'Shop' });
    expect(meta.robots).toBeUndefined();
  });

  it('uses the default site name and base URL when environment values are absent', () => {
    delete process.env.NEXT_PUBLIC_APP_NAME;
    delete process.env.NEXT_PUBLIC_APP_URL;

    const meta = buildMetadata({ title: 'Catalog', url: '/catalog' });

    expect(meta.title).toBe('Catalog | Shop');
    expect(meta.alternates?.canonical).toBe('/catalog');
  });
});
