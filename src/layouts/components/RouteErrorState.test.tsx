import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RouteErrorState } from '@/layouts/components/RouteErrorState';

const { captureError } = vi.hoisted(() => ({ captureError: vi.fn() }));

vi.mock('@/shared/monitoring/sentry', () => ({ captureError }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

beforeEach(() => {
  captureError.mockClear();
});

describe('RouteErrorState', () => {
  it('reports the error to monitoring with its digest', () => {
    const error = Object.assign(new Error('boom'), { digest: 'abc' });
    render(<RouteErrorState error={error} reset={vi.fn()} />);

    expect(captureError).toHaveBeenCalledWith(error, { digest: 'abc' });
  });

  it('calls reset when the visitor retries', () => {
    const reset = vi.fn();
    render(<RouteErrorState error={new Error('boom')} reset={reset} />);

    fireEvent.click(screen.getByRole('button', { name: 'retry' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
