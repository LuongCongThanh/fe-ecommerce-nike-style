import {
  getStorefrontCategories,
  getStorefrontProduct,
  getStorefrontProducts,
} from '@repo/api-sdk/endpoints/storefront-products';
import type { Product, ProductList } from '@/shared/types/product';
import { toStorefrontApiError } from '@/shared/lib/errors/toStorefrontApiError';

export const productActions = {
  list: async (filters: object) => {
    try {
      return (await getStorefrontProducts(filters as Record<string, unknown>)) as ProductList;
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  detail: async (slug: string) => {
    try {
      return (await getStorefrontProduct(slug)) as Product;
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
  categories: async () => {
    try {
      return await getStorefrontCategories();
    } catch (error) {
      throw toStorefrontApiError(error);
    }
  },
};
