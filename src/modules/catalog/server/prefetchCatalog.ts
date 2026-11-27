import { unstable_rethrow } from 'next/navigation';

import 'server-only';

import { dehydrate, type DehydratedState, noop, QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/integrations/backend/client/api-error';
import type { ProductDetail, ProductPage, ProductQuery } from '@/integrations/backend/models/catalog';
import {
  getCategoryTreeServer,
  getColorsServer,
  getProductBySlugServer,
  getProductsServer,
  getSizesServer,
} from '@/integrations/backend/server/catalog';
import { normalizeSearchQuery, parseCatalogFilters, parseCatalogOptionFilters, parsePageParam } from '@/modules/catalog/catalogUrlState';
import { catalogKeys } from '@/modules/catalog/queries/catalogKeys';
import {
  buildProductListQuery,
  buildRelatedQuery,
  buildSearchQuery,
  CATALOG_REFERENCE_STALE_TIME,
  type CategoryData,
  HOME_NEW_ARRIVALS_QUERY,
  resolveCategoryId,
  toCategoryData,
} from '@/modules/catalog/queries/catalogQuery';
import { QUERY_CLIENT_DEFAULTS } from '@/shared/queries/queryClientDefaults';

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

/**
 * A QueryClient for one request, never shared or cached across requests. Defaults come from the same
 * object as the browser client (`makeQueryClient`); only `retry` differs: the reader already has its
 * timeout and the server never retries (runtime.md).
 */
function createRequestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { ...QUERY_CLIENT_DEFAULTS, queries: { ...QUERY_CLIENT_DEFAULTS.queries, retry: false } },
  });
}

/** Logs a failed prefetch with its query key and failure class only: no URL, header, cookie or payload. */
function logPrefetchFailure(key: readonly unknown[], error: unknown): void {
  const detail = error instanceof ApiError ? `${error.code} (status ${String(error.status)})` : 'unexpected error';
  console.error(`[catalog] server prefetch failed for ${JSON.stringify(key)}: ${detail}`);
}

/** Wraps a reader so a failure is logged, then rethrown so `prefetchInto` keeps it out of the cache. */
function logged<T>(key: readonly unknown[], read: () => Promise<T>): () => Promise<T> {
  return async () => {
    try {
      return await read();
    } catch (error) {
      // Next.js control-flow errors (dynamic-usage bailout) are not read failures: do not log them.
      try {
        unstable_rethrow(error);
      } catch {
        throw error;
      }
      logPrefetchFailure(key, error);
      throw error;
    }
  };
}

/**
 * Reads one query into the request cache and returns what landed there. `query()` rejects on a
 * failed read; swallowing it here keeps the failure out of the cache, so hydration omits it.
 */
async function prefetchInto<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  read: () => Promise<T>,
  staleTime?: number,
): Promise<T | undefined> {
  await queryClient.query({ queryKey, queryFn: logged(queryKey, read), ...(staleTime === undefined ? {} : { staleTime }) }).catch(noop);
  return queryClient.getQueryData<T>(queryKey);
}

export function createCatalogPrefetcher(): CatalogPrefetcher {
  const queryClient = createRequestQueryClient();

  return {
    categories: async () =>
      prefetchInto(queryClient, catalogKeys.categories(), async () => toCategoryData(await getCategoryTreeServer()), CATALOG_REFERENCE_STALE_TIME),
    async options() {
      await Promise.all([
        prefetchInto(queryClient, catalogKeys.sizes(), getSizesServer, CATALOG_REFERENCE_STALE_TIME),
        prefetchInto(queryClient, catalogKeys.colors(), getColorsServer, CATALOG_REFERENCE_STALE_TIME),
      ]);
    },
    products: async (query) => prefetchInto(queryClient, catalogKeys.products(query), async () => getProductsServer(query)),
    async search(q, page) {
      const trimmed = normalizeSearchQuery(q);
      if (trimmed.length === 0) return undefined;
      return prefetchInto(queryClient, catalogKeys.search(trimmed, page), async () => getProductsServer(buildSearchQuery(trimmed, page)));
    },
    product: async (slug) =>
      prefetchInto(queryClient, catalogKeys.product(slug), async (): Promise<ProductDetail | null> => {
        try {
          return await getProductBySlugServer(slug);
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) return null;
          throw error;
        }
      }),
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

/**
 * `/[locale]/search`: only the results for the trimmed `q` and `page`. Search never touches the PLP
 * filters, categories, sizes or colors; an empty or whitespace `q` fetches nothing.
 */
export async function prefetchSearchResults(q: string | undefined, page: string | undefined): Promise<DehydratedState> {
  const prefetcher = createCatalogPrefetcher();
  await prefetcher.search(normalizeSearchQuery(q), parsePageParam(page));
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

/**
 * Home: the category tree for featured categories and the five newest products. Same keys and shapes as
 * `useCategoryTree` and the new-arrivals query, so the browser adds no second cache entry. A failed read
 * leaves its key out and the section shows its own loading/error/retry state.
 */
export async function prefetchHome(): Promise<DehydratedState> {
  const prefetcher = createCatalogPrefetcher();
  await Promise.all([prefetcher.categories(), prefetcher.products(HOME_NEW_ARRIVALS_QUERY)]);
  return prefetcher.dehydrate();
}
