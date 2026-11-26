import type { components } from '@/integrations/backend/generated/openapi';
import type {
  CategoryNode,
  ColorOption,
  ProductDetail,
  ProductImage,
  ProductPage,
  ProductQuery,
  ProductSummary,
  SizeOption,
} from '@/integrations/backend/models/catalog';

/**
 * Pure DTO -> storefront mappers for the public catalog, shared by the browser endpoints
 * (`catalog.ts`) and the server public reader (`server/catalog.ts`). No transport, no runtime state.
 */
type Schemas = components['schemas'];

export function toSummary(dto: Schemas['ProductListItemResponseDto']): ProductSummary {
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

export function toCategory(dto: Schemas['CategoryTreeNodeDto']): CategoryNode {
  return { id: dto.id, slug: dto.slug, name: dto.name, children: dto.children.map(toCategory) };
}

function toImages(dtos: Array<Schemas['ImageResponseDto']>): ProductImage[] {
  return dtos.flatMap((dto) =>
    dto.url === null ? [] : [{ id: dto.id, url: dto.url, colorId: dto.colorId, isPrimary: dto.isPrimary, altText: dto.altText }],
  );
}

export function toDetail(dto: Schemas['ProductDetailResponseDto']): ProductDetail {
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

export function toProductPage(page: Schemas['PaginatedProductListResponseDto']): ProductPage {
  return {
    data: page.data.map(toSummary),
    meta: { page: page.meta.page, total: page.meta.total, totalPages: page.meta.totalPages },
  };
}

export function toSizes(sizes: Array<Schemas['SizeResponseDto']>): SizeOption[] {
  return sizes.map(({ id, code, name }) => ({ id, code, name }));
}

export function toColors(colors: Array<Schemas['ColorResponseDto']>): ColorOption[] {
  return colors.map(({ id, code, name, hex }) => ({ id, code, name, hex }));
}

/** Query-string params for `GET /products`, in the order the API documents them. */
export function toProductListParams(query: ProductQuery) {
  return {
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
  };
}
