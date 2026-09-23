import axios, { type AxiosResponse } from 'axios';

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
  signal?: AbortSignal;
}

const axiosInstance = axios.create({
  withCredentials: true,
  // Tự xử lý status để mọi lỗi HTTP đều được chuẩn hóa thành ApiError.
  validateStatus: () => true,
});

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

// Nhiều request cùng nhận 401 chỉ được dùng chung một lần refresh token.
let inFlightRefresh: Promise<string> | null = null;

async function refreshSessionOnce(runtimeAdapter: AuthRuntimeAdapter): Promise<string> {
  inFlightRefresh ??= runtimeAdapter.refreshSession().finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  return Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase());
}

async function executeRequest<TResponse>(
  config: RequestConfig<TResponse>,
  tokenOverride?: string,
  forceSkipRefresh = false,
): Promise<AxiosResponse<unknown>> {
  const runtimeAdapter = getAuthRuntimeAdapter();
  const token = tokenOverride ?? runtimeAdapter?.getAccessToken() ?? null;
  const headers = { ...config.headers };

  if (config.data !== undefined && !hasHeader(headers, 'Content-Type')) {
    headers['Content-Type'] = 'application/json';
  }

  if (token !== null && !hasHeader(headers, 'Authorization')) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axiosInstance.request<unknown>({
    url: withQueryString(config.url, config.params),
    method: config.method,
    headers,
    data: config.data,
    signal: config.signal,
  });

  if (response.status !== 401 || config.skipRefresh === true || forceSkipRefresh) {
    return response;
  }

  if (runtimeAdapter === null) {
    return response;
  }

  try {
    const refreshedToken = await refreshSessionOnce(runtimeAdapter);

    return await executeRequest(config, refreshedToken, true);
  } catch (error) {
    runtimeAdapter.onAuthFailure?.(error);
    throw error;
  }
}

export async function request<TResponse>(config: RequestConfig<TResponse>): Promise<TResponse> {
  let response: AxiosResponse<unknown>;

  try {
    response = await executeRequest(config);
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;

    if (error.response !== undefined) {
      throw ApiError.fromPayload(error.response.status, error.response.data);
    }

    const isCanceled = error.code === 'ERR_CANCELED';
    throw new ApiError(0, isCanceled ? 'REQUEST_CANCELED' : 'NETWORK_ERROR', isCanceled ? 'Request canceled' : 'Network request failed');
  }

  if (response.status < 200 || response.status >= 300) {
    throw ApiError.fromPayload(response.status, response.data);
  }

  const body = response.status === 204 ? undefined : response.data;

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

/** Chỉ dùng trong test để tránh trạng thái refresh/auth rò rỉ giữa các test case. */
export function resetAuthRuntime(): void {
  inFlightRefresh = null;
  clearAuthRuntimeAdapter();
}
