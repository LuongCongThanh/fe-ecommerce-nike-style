import 'server-only';

import { toCategory, toColors, toDetail, toProductListParams, toProductPage, toSizes } from '@/integrations/backend/endpoints/catalog.mapper';
import type { components } from '@/integrations/backend/generated/openapi';
import type { CategoryNode, ColorOption, ProductDetail, ProductPage, ProductQuery, SizeOption } from '@/integrations/backend/models/catalog';
import { serverGet } from '@/integrations/backend/server/http';

type Schemas = components['schemas'];

/**
 * Public catalog reader for Server Components. Same paths, params and mappers as
 * `endpoints/catalog.ts`, but anonymous, uncached, 5 s timeout and no retry. Product 404 surfaces
 * as `ApiError` here; the catalog prefetch layer turns it into `null` like the browser hook does.
 */
export async function getProductsServer(query: ProductQuery = {}): Promise<ProductPage> {
  return toProductPage(await serverGet<Schemas['PaginatedProductListResponseDto']>('/products', toProductListParams(query)));
}

export async function getProductBySlugServer(slug: string): Promise<ProductDetail> {
  return toDetail(await serverGet<Schemas['ProductDetailResponseDto']>(`/products/slug/${encodeURIComponent(slug)}`));
}

export async function getCategoryTreeServer(): Promise<CategoryNode[]> {
  return (await serverGet<Array<Schemas['CategoryTreeNodeDto']>>('/categories')).map(toCategory);
}

export async function getSizesServer(): Promise<SizeOption[]> {
  return toSizes(await serverGet<Array<Schemas['SizeResponseDto']>>('/sizes'));
}

export async function getColorsServer(): Promise<ColorOption[]> {
  return toColors(await serverGet<Array<Schemas['ColorResponseDto']>>('/colors'));
}
