import { apiClient } from '@/lib/api/client/fetcher';
import { API_BASE_URL } from '@/lib/api/env/config';
import type { components } from '@/lib/api/generated/openapi';
import type {
  CategoryNode,
  ColorOption,
  ProductDetail,
  ProductImage,
  ProductPage,
  ProductQuery,
  ProductSummary,
  SizeOption,
} from '@/lib/api/models/catalog';

type Schemas = components['schemas'];

/**
 * be-demo public API, reached through the Next.js `/api/v1` rewrite (next.config.ts). The browser uses
 * a relative URL so it always hits the origin serving the page; Node needs the absolute origin.
 */
const API = `${typeof window === 'undefined' ? API_BASE_URL : ''}/api/v1`;

function toSummary(dto: Schemas['ProductListItemResponseDto']): ProductSummary {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    gender: dto.gender,
    imageUrl: dto.imageUrl,
    minPrice: dto.minPrice,
    maxPrice: dto.maxPrice,
  };
}

function toCategory(dto: Schemas['CategoryTreeNodeDto']): CategoryNode {
  return { id: dto.id, slug: dto.slug, name: dto.name, children: dto.children.map(toCategory) };
}

function toImages(dtos: Array<Schemas['ImageResponseDto']>): ProductImage[] {
  return dtos.flatMap((dto) =>
    dto.url === null ? [] : [{ id: dto.id, url: dto.url, colorId: dto.colorId, isPrimary: dto.isPrimary, altText: dto.altText }],
  );
}

function toDetail(dto: Schemas['ProductDetailResponseDto']): ProductDetail {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    description: dto.description ?? '',
    categoryId: dto.categoryId,
    gender: dto.gender,
    variants: dto.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: variant.price,
      size: { id: variant.size.id, code: variant.size.code, name: variant.size.name },
      color: { id: variant.color.id, code: variant.color.code, name: variant.color.name, hex: variant.color.hex },
    })),
    images: toImages(dto.images),
  };
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
  const page = await apiClient.get<Schemas['PaginatedProductListResponseDto']>(`${API}/products`, {
    page: query.page,
    limit: query.limit,
    categoryId: query.categoryId,
    q: query.q,
    gender: query.gender,
    size: query.size,
    color: query.color,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sort: query.sort,
  });
  return {
    data: page.data.map(toSummary),
    meta: { page: page.meta.page, total: page.meta.total, totalPages: page.meta.totalPages },
  };
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
  const sizes = await apiClient.get<Array<Schemas['SizeResponseDto']>>(`${API}/sizes`);
  return sizes.map(({ id, code, name }) => ({ id, code, name }));
}

/** Visible colors — the PLP color filter. */
export async function getColors(): Promise<ColorOption[]> {
  const colors = await apiClient.get<Array<Schemas['ColorResponseDto']>>(`${API}/colors`);
  return colors.map(({ id, code, name, hex }) => ({ id, code, name, hex }));
}
