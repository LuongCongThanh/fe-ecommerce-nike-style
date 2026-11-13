/**
 * Storefront view of the be-demo catalog. `src/lib/api/endpoints/catalog.ts` maps the generated
 * OpenAPI DTOs into these shapes, so UI code never imports a DTO.
 */

/** Who a Product is for (BR-CAT-14). Filtering MEN or WOMEN also returns UNISEX. */
export type Gender = 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX';
export const GENDERS: readonly Gender[] = ['MEN', 'WOMEN', 'KIDS', 'UNISEX'];

export type CatalogSort = 'newest' | 'price_asc' | 'price_desc';

/** A Category with its visible children, ordered as the API returns them. */
export interface CategoryNode {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly children: readonly CategoryNode[];
}

/** Flat entry for slug lookups and breadcrumbs. */
export interface CategoryEntry {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly parentId: string | null;
}

export interface SizeOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface ColorOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly hex: string;
}

/** A card in a listing. Prices are integer VND over the Product's active Variants. */
export interface ProductSummary {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly gender: Gender;
  readonly imageUrl: string | null;
  readonly minPrice: number;
  readonly maxPrice: number;
}

export interface ProductPage {
  readonly data: readonly ProductSummary[];
  readonly meta: { readonly page: number; readonly total: number; readonly totalPages: number };
}

export interface ProductQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly categoryId?: string;
  readonly q?: string;
  readonly gender?: readonly Gender[];
  readonly size?: readonly string[];
  readonly color?: readonly string[];
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly sort?: CatalogSort;
}

export interface ProductVariant {
  readonly id: string;
  readonly sku: string;
  readonly price: number;
  readonly size: SizeOption;
  readonly color: ColorOption;
}

/** Images belong to a Color (BR-CAT-05); only images with a public URL are kept. */
export interface ProductImage {
  readonly id: string;
  readonly url: string;
  readonly colorId: string;
  readonly isPrimary: boolean;
  readonly altText: string | null;
}

export interface ProductDetail {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly categoryId: string;
  readonly gender: Gender;
  readonly variants: readonly ProductVariant[];
  readonly images: readonly ProductImage[];
}
