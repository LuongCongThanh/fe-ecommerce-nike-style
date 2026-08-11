import { ApiError } from './api-error';
import { type AuthRuntimeAdapter, clearAuthRuntimeAdapter, getAuthRuntimeAdapter } from './runtime';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type QueryParamValue = string | number | boolean | null | undefined;

export interface ErrorEnvelope {
  message?: string;
  detail?: string;
  code?: string;
  details?: unknown;
}

export interface ApiEnvelope<T> {
  data: T;
}

export interface ResponseSchema<TResponse> {
  parse(input: unknown): TResponse;
}

export interface RequestConfig<TResponse> {
  url: string;
  method: RequestMethod;
  params?: Record<string, QueryParamValue>;
  data?: unknown;
  schema?: ResponseSchema<TResponse>;
  skipRefresh?: boolean;
  headers?: Record<string, string>;
}

function withQueryString(url: string, params?: Record<string, QueryParamValue>): string {
  if (params === undefined) return url;

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();

  if (query === '') return url;

  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  return response.json().catch(() => undefined);
}

// Single-flight guard: two requests hitting 401 around the same time must share one refresh call, not
// each rotate the refresh token independently — a second, concurrent rotation attempt would find the
// first one's token already consumed and trip reuse-detection, force-logging-out a legitimate user.
let inFlightRefresh: Promise<string> | null = null;

async function refreshSessionOnce(runtimeAdapter: AuthRuntimeAdapter): Promise<string> {
  inFlightRefresh ??= runtimeAdapter.refreshSession().finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

async function executeFetch<TResponse>(config: RequestConfig<TResponse>, tokenOverride?: string, forceSkipRefresh = false): Promise<Response> {
  const runtimeAdapter = getAuthRuntimeAdapter();
  const token = tokenOverride ?? runtimeAdapter?.getAccessToken() ?? null;
  const headers = new Headers(config.headers);

  if (config.data !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token !== null && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(withQueryString(config.url, config.params), {
    method: config.method,
    credentials: 'include',
    headers,
    body: config.data === undefined ? undefined : JSON.stringify(config.data),
  });

  if (response.status !== 401 || config.skipRefresh === true || forceSkipRefresh) {
    return response;
  }

  if (runtimeAdapter === null) {
    return response;
  }

  try {
    const refreshedToken = await refreshSessionOnce(runtimeAdapter);

    return await executeFetch(config, refreshedToken, true);
  } catch (error) {
    runtimeAdapter.onAuthFailure?.(error);
    throw error;
  }
}

export async function request<TResponse>(config: RequestConfig<TResponse>): Promise<TResponse> {
  const response = await executeFetch(config);

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  const body = await parseResponseBody(response);

  if (config.schema !== undefined) {
    return config.schema.parse(body);
  }

  return body as TResponse;
}

export const apiClient = {
  get: async <TResponse>(
    url: string,
    params?: Record<string, QueryParamValue>,
    options?: Omit<RequestConfig<TResponse>, 'url' | 'method' | 'params'>,
  ): Promise<TResponse> =>
    request<TResponse>({
      ...options,
      url,
      method: 'GET',
      params,
    }),

  post: async <TResponse>(url: string, data?: unknown, options?: Omit<RequestConfig<TResponse>, 'url' | 'method' | 'data'>): Promise<TResponse> =>
    request<TResponse>({
      ...options,
      url,
      method: 'POST',
      data,
    }),

  put: async <TResponse>(url: string, data?: unknown, options?: Omit<RequestConfig<TResponse>, 'url' | 'method' | 'data'>): Promise<TResponse> =>
    request<TResponse>({
      ...options,
      url,
      method: 'PUT',
      data,
    }),

  patch: async <TResponse>(url: string, data?: unknown, options?: Omit<RequestConfig<TResponse>, 'url' | 'method' | 'data'>): Promise<TResponse> =>
    request<TResponse>({
      ...options,
      url,
      method: 'PATCH',
      data,
    }),

  delete: async <TResponse>(url: string, options?: Omit<RequestConfig<TResponse>, 'url' | 'method'>): Promise<TResponse> =>
    request<TResponse>({
      ...options,
      url,
      method: 'DELETE',
    }),
};

/** Test-only: clears the in-flight refresh guard and the registered auth adapter, so a refresh started in one test can't bleed into the next. */
export function resetAuthRuntime(): void {
  inFlightRefresh = null;
  clearAuthRuntimeAdapter();
}
