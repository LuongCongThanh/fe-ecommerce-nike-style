import { apiClient } from '@/integrations/backend/client/fetcher';
import { toCategory, toColors, toDetail, toProductListParams, toProductPage, toSizes } from '@/integrations/backend/endpoints/catalog.mapper';
import { API_BASE_URL } from '@/integrations/backend/env/config';
import type { components } from '@/integrations/backend/generated/openapi';
import type { CategoryNode, ColorOption, ProductDetail, ProductPage, ProductQuery, SizeOption } from '@/integrations/backend/models/catalog';

type Schemas = components['schemas'];

/**
 * be-demo public API, reached through the Next.js `/api/v1` rewrite (next.config.ts). The browser uses
 * a relative URL so it always hits the origin serving the page; Node needs the absolute origin.
 */
const API = `${typeof window === 'undefined' ? API_BASE_URL : ''}/api/v1`;

export async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
  const page = await apiClient.get<Schemas['PaginatedProductListResponseDto']>(`${API}/products`, toProductListParams(query));
  return toProductPage(page);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const dto = await apiClient.get<Schemas['ProductDetailResponseDto']>(`${API}/products/slug/${encodeURIComponent(slug)}`);
  return toDetail(dto);
}

/** Visible Category tree; roots and children ordered by the back-office sort order. */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const roots = await apiClient.get<Array<Schemas['CategoryTreeNodeDto']>>(`${API}/categories`);
  return roots.map(toCategory);
}

/** Visible sizes, in display order — the PLP size filter. */
export async function getSizes(): Promise<SizeOption[]> {
  return toSizes(await apiClient.get<Array<Schemas['SizeResponseDto']>>(`${API}/sizes`));
}

/** Visible colors — the PLP color filter. */
export async function getColors(): Promise<ColorOption[]> {
  return toColors(await apiClient.get<Array<Schemas['ColorResponseDto']>>(`${API}/colors`));
}
