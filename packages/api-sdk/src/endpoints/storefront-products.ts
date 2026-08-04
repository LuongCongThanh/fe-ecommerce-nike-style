import { apiClient } from '../client/fetcher';
import { API_BASE_URL } from '../env/config';

const STOREFRONT_PRODUCTS_API = {
  LIST: `${API_BASE_URL}/api/products/`,
  DETAIL: (slug: string) => `${API_BASE_URL}/api/products/${slug}/`,
  CATEGORIES: `${API_BASE_URL}/api/categories/`,
} as const;

export interface StorefrontProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface StorefrontProductVariant {
  id: number;
  size: string | null;
  color: string | null;
  stock: number;
  price: number;
  sku?: string;
}

export interface StorefrontProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  images: string[];
  category: StorefrontProductCategory;
  variants?: StorefrontProductVariant[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontProductList {
  results: StorefrontProduct[];
  count: number;
  next: string | null;
  previous: string | null;
}

export async function getStorefrontProducts(filters: Record<string, unknown> = {}): Promise<StorefrontProductList> {
  return apiClient.get<StorefrontProductList>(STOREFRONT_PRODUCTS_API.LIST, filters);
}

export async function getStorefrontProduct(slug: string): Promise<StorefrontProduct> {
  return apiClient.get<StorefrontProduct>(STOREFRONT_PRODUCTS_API.DETAIL(slug));
}

export async function getStorefrontCategories(): Promise<StorefrontProductCategory[]> {
  return apiClient.get<StorefrontProductCategory[]>(STOREFRONT_PRODUCTS_API.CATEGORIES);
}
