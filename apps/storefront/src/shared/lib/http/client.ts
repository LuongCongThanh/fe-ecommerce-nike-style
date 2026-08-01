import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';

import { ApiError } from '@/shared/lib/errors/api-error';
import type { ApiRequestConfig, ApiResponse } from '@/shared/lib/http/api-types';
import { getHttpRuntimeAdapter } from '@/shared/lib/http/runtime';
import { validateResponse } from '@/shared/lib/http/zod-helpers';
import { captureError } from '@/shared/lib/monitoring/sentry';

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function resolveRefreshQueue(token: string): void {
  refreshQueue.forEach(({ resolve }) => {
    resolve(token);
  });
  refreshQueue = [];
}

function rejectRefreshQueue(err: unknown): void {
  refreshQueue.forEach(({ reject }) => {
    reject(err);
  });
  refreshQueue = [];
}

function normalizeError(error: unknown): ApiError {
  const axiosError = error as AxiosError<{
    message?: string;
    detail?: string;
    code?: string;
    details?: unknown;
  }>;

  const status = axiosError.response?.status ?? 500;
  const data = axiosError.response?.data;
  const rawMessage = data?.detail ?? data?.message ?? axiosError.message;
  const message = rawMessage !== '' ? rawMessage : 'Đã có lỗi xảy ra';

  if (status >= 500) {
    captureError(axiosError, { url: axiosError.config?.url, status });
  }

  return new ApiError({
    message,
    status,
    code: data?.code,
    details: data?.details ?? data,
  });
}

httpClient.interceptors.request.use((config) => {
  const token = getHttpRuntimeAdapter()?.getAccessToken() ?? null;

  if (token !== null && config.headers.Authorization === undefined) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as AxiosRequestConfig & {
      _retry?: boolean;
      skipRefreshToken?: boolean;
    };

    if (axiosError.response?.status === 401 && originalRequest._retry !== true && originalRequest.skipRefreshToken !== true) {
      originalRequest._retry = true;

      if (isRefreshing) {
        const token = await new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        });

        if (originalRequest.headers !== undefined) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        return await httpClient(originalRequest);
      }

      isRefreshing = true;

      try {
        const runtimeAdapter = getHttpRuntimeAdapter();

        if (runtimeAdapter === null) {
          throw new Error('No HTTP runtime adapter registered');
        }

        const newToken = await runtimeAdapter.refreshAccessToken();
        resolveRefreshQueue(newToken);

        if (originalRequest.headers !== undefined) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return await httpClient(originalRequest);
      } catch (refreshError) {
        getHttpRuntimeAdapter()?.onRefreshFailure?.(refreshError);
        rejectRefreshQueue(refreshError);
        return await Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return await Promise.reject(normalizeError(error));
  },
);

async function request<TSchema>(config: ApiRequestConfig<TSchema>): Promise<TSchema> {
  const response = await httpClient.request<ApiResponse<TSchema>>(config);
  const payload = response.data.data;

  if (config.schema !== undefined) {
    return validateResponse(config.schema, payload);
  }

  return payload;
}

export const http = {
  get: async <T>(url: string, params?: object) => request<T>({ url, method: 'GET', params }),
  post: async <T>(url: string, body?: unknown) => request<T>({ url, method: 'POST', data: body }),
  put: async <T>(url: string, body?: unknown) => request<T>({ url, method: 'PUT', data: body }),
  patch: async <T>(url: string, body?: unknown) => request<T>({ url, method: 'PATCH', data: body }),
  delete: async <T>(url: string) => request<T>({ url, method: 'DELETE' }),
};
