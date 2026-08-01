import { ApiError } from '@/shared/lib/errors/api-error';

export async function callAuthRoute<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const message = typeof json.message === 'string' ? json.message : 'Đã có lỗi xảy ra';
    throw new ApiError({ message, status: res.status });
  }

  return json as T;
}
