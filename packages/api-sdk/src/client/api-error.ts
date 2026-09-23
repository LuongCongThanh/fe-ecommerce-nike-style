import { ErrorEnvelopeSchema } from '@repo/schemas/errors';

/** Lỗi chuẩn của tầng API, giúp UI không phụ thuộc trực tiếp vào cấu trúc lỗi của Axios. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isForbidden(): boolean {
    return this.status === 403;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }
  get isServerError(): boolean {
    return this.status >= 500;
  }

  static fromPayload(status: number, body: unknown): ApiError {
    const parsed = ErrorEnvelopeSchema.safeParse(body);

    if (parsed.success) {
      return new ApiError(status, parsed.data.error.code, parsed.data.error.message, parsed.data.error.details);
    }

    return new ApiError(status, 'UNKNOWN_ERROR', `Request failed: ${String(status)}`);
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const body: unknown = await response.json().catch(() => null);
    return ApiError.fromPayload(response.status, body);
  }
}
