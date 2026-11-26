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

async function prefetchListing(categorySlug: string | undefined, searchParams: URLSearchParams): Promise<DehydratedState> {
  const prefetcher = createCatalogPrefetcher();
  const filters = parseCatalogFilters(searchParams);
  const options = parseCatalogOptionFilters(searchParams);
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
 * `/[locale]/products`: categories, sizes and colors for the filter sidebar plus the product page the
 * URL asks for. With `?category=<slug>` the tree resolves the slug first; a slug that is not in the
 * tree (or a tree that failed to load) fetches no products, as the browser hook does.
 */
export async function prefetchProductsListing(searchParams: URLSearchParams): Promise<DehydratedState> {
  return prefetchListing(searchParams.get('category') ?? undefined, searchParams);
}

/**
 * `/[locale]/categories/[slug]`: the same data as the PLP, with the slug taken from the path (it wins
 * over any `?category=`, as `useCatalogListing(categorySlug)` does). The tree resolves the slug before
 * products are requested; an unknown slug fetches no products and the page shows its not-found state.
 */
export async function prefetchCategoryListing(slug: string, searchParams: URLSearchParams): Promise<DehydratedState> {
  return prefetchListing(slug, searchParams);
}

/** Reads `page` the way `useProductSearchListing` does: a positive integer, otherwise 1. */
export function parseSearchPage(value: string | null | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/**
 * `/[locale]/search`: only the results for the trimmed `q` and `page`. Search never touches the PLP
 * filters, categories, sizes or colors; an empty or whitespace `q` fetches nothing.
 */
export async function prefetchSearchResults(q: string | undefined, page: string | undefined): Promise<DehydratedState> {
  const prefetcher = createCatalogPrefetcher();
  await prefetcher.search(q ?? '', parseSearchPage(page));
  return prefetcher.dehydrate();
}
