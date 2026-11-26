import 'server-only';

import { dehydrate, type DehydratedState, QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/integrations/backend/client/api-error';
import type { ProductDetail, ProductPage, ProductQuery } from '@/integrations/backend/models/catalog';
import {
  getCategoryTreeServer,
  getColorsServer,
  getProductBySlugServer,
  getProductsServer,
  getSizesServer,
} from '@/integrations/backend/server/catalog';
import { parseCatalogFilters, parseCatalogOptionFilters } from '@/modules/catalog/catalogUrlState';
import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';
import {
  buildProductListQuery,
  buildRelatedQuery,
  buildSearchQuery,
  CATALOG_REFERENCE_STALE_TIME,
  type CategoryData,
  resolveCategoryId,
  toCategoryData,
} from '@/modules/catalog/queries/catalogQuery';

/**
 * Server prefetch for public catalog pages. Writes the same keys, shapes and normalization as the
 * browser hooks (`queries/use*.ts`) into a QueryClient that lives for one request. Only successful
 * queries are dehydrated: a timeout, network error or 5xx leaves the key out so the browser hook
 * fetches it again and shows its own error/retry. Nothing here reads a cookie, token or session.
 */
export interface CatalogPrefetcher {
  /** `{tree, flat}` under `catalogKeys.categories()`; `undefined` when the read failed. */
  categories(): Promise<CategoryData | undefined>;
  /** Sizes and colors for the PLP filter. */
  options(): Promise<void>;
  products(query: ProductQuery): Promise<ProductPage | undefined>;
  /** Search results for a trimmed, non-empty `q`; an empty `q` prefetches nothing. */
  search(q: string, page: number): Promise<ProductPage | undefined>;
  /** Product by slug; an API 404 is stored as `null`, the same as `useProduct`. */
  product(slug: string): Promise<ProductDetail | null | undefined>;
  /** Successful queries only, safe to pass to `HydrationBoundary`. */
  dehydrate(): DehydratedState;
}

/** A QueryClient for one request: no retry (the reader already has its timeout), never shared or cached across requests. */
function createRequestQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

export function createCatalogPrefetcher(): CatalogPrefetcher {
  const queryClient = createRequestQueryClient();

  return {
    async categories() {
      await queryClient.prefetchQuery({
        queryKey: catalogKeys.categories(),
        queryFn: async () => toCategoryData(await getCategoryTreeServer()),
        staleTime: CATALOG_REFERENCE_STALE_TIME,
      });
      return queryClient.getQueryData<CategoryData>(catalogKeys.categories());
    },
    async options() {
      await Promise.all([
        queryClient.prefetchQuery({ queryKey: catalogKeys.sizes(), queryFn: getSizesServer, staleTime: CATALOG_REFERENCE_STALE_TIME }),
        queryClient.prefetchQuery({ queryKey: catalogKeys.colors(), queryFn: getColorsServer, staleTime: CATALOG_REFERENCE_STALE_TIME }),
      ]);
    },
    async products(query) {
      await queryClient.prefetchQuery({ queryKey: catalogKeys.products(query), queryFn: async () => getProductsServer(query) });
      return queryClient.getQueryData<ProductPage>(catalogKeys.products(query));
    },
    async search(q, page) {
      const trimmed = q.trim();
      if (trimmed.length === 0) return undefined;
      const key = catalogKeys.search(trimmed, page);
      await queryClient.prefetchQuery({ queryKey: key, queryFn: async () => getProductsServer(buildSearchQuery(trimmed, page)) });
      return queryClient.getQueryData<ProductPage>(key);
    },
    async product(slug) {
      const key = catalogKeys.product(slug);
      await queryClient.prefetchQuery({
        queryKey: key,
        queryFn: async () => {
          try {
            return await getProductBySlugServer(slug);
          } catch (error) {
            if (error instanceof ApiError && error.status === 404) return null;
            throw error;
          }
        },
      });
      return queryClient.getQueryData<ProductDetail | null>(key);
    },
    dehydrate: () => dehydrate(queryClient),
  };
}

/**
 * `/[locale]/products`: categories, sizes and colors for the filter sidebar plus the product page the
 * URL asks for. With `?category=<slug>` the tree resolves the slug first; a slug that is not in the
 * tree (or a tree that failed to load) fetches no products, as the browser hook does.
 */
export async function prefetchProductsListing(searchParams: URLSearchParams): Promise<DehydratedState> {
  const prefetcher = createCatalogPrefetcher();
  const filters = parseCatalogFilters(searchParams);
  const options = parseCatalogOptionFilters(searchParams);
  const categorySlug = searchParams.get('category') ?? undefined;
  const categoriesRead = prefetcher.categories();

  const loadProducts = async (): Promise<void> => {
    if (categorySlug === undefined) {
      await prefetcher.products(buildProductListQuery(undefined, filters, options));
      return;
    }
    const categoryId = resolveCategoryId(await categoriesRead, categorySlug);
    if (categoryId !== undefined) await prefetcher.products(buildProductListQuery(categoryId, filters, options));
  };

  await Promise.all([categoriesRead, prefetcher.options(), loadProducts()]);
  return prefetcher.dehydrate();
}

/**
 * `/[locale]/products/[slug]`: the Product by slug, then its related strip when it has a Category.
 * A 404 is stored as `null` (the page keeps its not-found UI). A failed related read, or a failed
 * product read, leaves that key out so the browser hook fetches it again; the related read never
 * blocks or invalidates the product.
 */
export async function prefetchProductDetail(slug: string): Promise<DehydratedState> {
  const prefetcher = createCatalogPrefetcher();
  const product = await prefetcher.product(slug);
  if (product !== undefined && product !== null) await prefetcher.products(buildRelatedQuery(product.categoryId));
  return prefetcher.dehydrate();
}
