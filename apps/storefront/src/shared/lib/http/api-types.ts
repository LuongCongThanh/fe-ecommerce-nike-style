import type { AxiosRequestConfig } from 'axios';
import type { z } from 'zod';

export type ApiResponse<T> = {
  data: T;
  message?: string;
  status?: number;
};

export type ApiRequestConfig<TSchema = unknown> = AxiosRequestConfig & {
  schema?: z.ZodType<TSchema>;
  skipAuth?: boolean;
  skipRefreshToken?: boolean;
  retry?: boolean;
};

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
