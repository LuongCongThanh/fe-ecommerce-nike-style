import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { pathToFileURL } from 'node:url';

import { catalogColors, catalogProducts, catalogSizes, categoryTree, productDetails } from '@/../e2e/support/catalog-fixtures';

interface RequestRecord {
  method: string;
  path: string;
  query: Record<string, string>;
  requestId: string | null;
  hasAuthorization: boolean;
  hasCookie: boolean;
}

interface HarnessResponse {
  status: number;
  body: unknown;
}

const PORT = Number(process.env.E2E_CATALOG_PORT ?? 4010);

function respond(response: ServerResponse, status: number, body: unknown): void {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('en');
}

/** `GET /api/v1/products`: validates paging, then filters, sorts and pages the fixture list. */
function listProducts(url: URL): HarnessResponse {
  const page = Number(url.searchParams.get('page') ?? 1);
  const limit = Number(url.searchParams.get('limit') ?? 12);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return { status: 400, body: { statusCode: 400, message: 'Invalid pagination', error: 'Bad Request' } };
  }

  const query = normalize(url.searchParams.get('q') ?? '');
  const categoryId = url.searchParams.get('categoryId');
  const gender = url.searchParams.get('gender')?.toUpperCase();
  const minPrice = Number(url.searchParams.get('minPrice') ?? 0);
  const maxPrice = Number(url.searchParams.get('maxPrice') ?? Number.MAX_SAFE_INTEGER);

  let products = catalogProducts.filter(({ product, searchTerms }) => {
    const matchesQuery = query.length === 0 || normalize(`${product.name} ${searchTerms.join(' ')}`).includes(query);
    return (
      matchesQuery &&
      (categoryId === null || product.categoryId === categoryId) &&
      (gender === undefined || product.gender === gender) &&
      product.minPrice >= minPrice &&
      product.minPrice <= maxPrice
    );
  });

  const sort = url.searchParams.get('sort');
  if (sort === 'price_asc') products = [...products].sort((a, b) => a.product.minPrice - b.product.minPrice);
  if (sort === 'price_desc') products = [...products].sort((a, b) => b.product.minPrice - a.product.minPrice);

  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return {
    status: 200,
    body: {
      data: products.slice(start, start + limit).map(({ product }) => product),
      meta: { page, limit, total, totalPages },
    },
  };
}

function handleRequest(request: IncomingMessage, response: ServerResponse, requestRecords: RequestRecord[]): void {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');

  if (url.pathname === '/health' && request.method === 'GET') {
    respond(response, 200, { status: 'ok' });
    return;
  }

  if (url.pathname === '/__test/requests' && request.method === 'GET') {
    const requestId = url.searchParams.get('requestId');
    respond(
      response,
      200,
      requestRecords.filter((record) => record.requestId === requestId),
    );
    return;
  }

  const headers = request.headers;
  requestRecords.push({
    method: request.method ?? 'UNKNOWN',
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    requestId: typeof headers['x-e2e-request-id'] === 'string' ? headers['x-e2e-request-id'] : null,
    hasAuthorization: headers.authorization !== undefined,
    hasCookie: headers.cookie !== undefined,
  });

  if (request.method !== 'GET') {
    response.setHeader('allow', 'GET');
    respond(response, 405, { statusCode: 405, message: 'Method not allowed', error: 'Method Not Allowed' });
    return;
  }

  const scenario = url.searchParams.get('scenario');
  const sendFixtureResponse = () => {
    const { status, body } = scenario === 'server-error' ? serverError : resolveCatalogRoute(url, scenario);
    respond(response, status, body);
  };

  if (scenario === 'delay') {
    const delayMs = Math.max(0, Math.min(Number(url.searchParams.get('delayMs') ?? 25), 5_000));
    setTimeout(sendFixtureResponse, delayMs);
    return;
  }

  sendFixtureResponse();
}

const serverError: HarnessResponse = { status: 503, body: { statusCode: 503, message: 'Fixture service unavailable', error: 'Service Unavailable' } };
const routeNotFound: HarnessResponse = { status: 404, body: { statusCode: 404, message: 'Route not found', error: 'Not Found' } };
const emptyProductPage: HarnessResponse = { status: 200, body: { data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } } };

const fixedRoutes = new Map<string, (url: URL) => HarnessResponse>([
  ['/api/v1/categories', () => ({ status: 200, body: categoryTree })],
  ['/api/v1/sizes', () => ({ status: 200, body: catalogSizes })],
  ['/api/v1/colors', () => ({ status: 200, body: catalogColors })],
  ['/api/v1/products', listProducts],
]);

const PRODUCT_SLUG_PREFIX = '/api/v1/products/slug/';

function findProductBySlug(slug: string): HarnessResponse {
  const detail = productDetails.find((product) => product.slug === slug);
  return detail === undefined
    ? { status: 404, body: { statusCode: 404, message: 'Product not found', error: 'Not Found' } }
    : { status: 200, body: detail };
}

/** Maps a catalog `GET` path to its fixture response; `scenario=empty` empties the product list only. */
function resolveCatalogRoute(url: URL, scenario: string | null): HarnessResponse {
  if (url.pathname === '/api/v1/products' && scenario === 'empty') return emptyProductPage;

  const fixedRoute = fixedRoutes.get(url.pathname);
  if (fixedRoute !== undefined) return fixedRoute(url);

  if (url.pathname.startsWith(PRODUCT_SLUG_PREFIX)) return findProductBySlug(url.pathname.slice(PRODUCT_SLUG_PREFIX.length));

  return routeNotFound;
}

export function createCatalogServer(): Server {
  const requestRecords: RequestRecord[] = [];
  return createServer((request, response) => {
    handleRequest(request, response, requestRecords);
  });
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createCatalogServer();
  server.listen(PORT, '127.0.0.1', () => {
    console.warn(`E2E catalog fixture listening on http://127.0.0.1:${String(PORT)}`);
  });
  server.on('error', (error) => {
    console.error('E2E catalog fixture failed to start', error);
    process.exitCode = 1;
  });
}
