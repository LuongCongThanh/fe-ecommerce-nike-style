import { ErrorEnvelopeSchema } from '@repo/schemas/errors';

/** Thrown by `fetcher` on a non-2xx response. Parses the body against the shared `ErrorEnvelopeSchema` so callers get a typed code/message instead of a raw status. */
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

  static async fromResponse(response: Response): Promise<ApiError> {
    const body: unknown = await response.json().catch(() => null);
    const parsed = ErrorEnvelopeSchema.safeParse(body);

    if (parsed.success) {
      return new ApiError(response.status, parsed.data.error.code, parsed.data.error.message, parsed.data.error.details);
    }

    return new ApiError(response.status, 'UNKNOWN_ERROR', `Request failed: ${String(response.status)}`);
  }
}
