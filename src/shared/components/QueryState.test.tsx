import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { QueryState } from '@/shared/components/QueryState';

const defaultProps: ComponentProps<typeof QueryState> = {
  isLoading: false,
  loadingLabel: 'Loading products',
  errorTitle: 'Could not load products',
  errorFallbackDescription: 'Please try again later.',
  retryLabel: 'Retry',
  children: <p>Product results</p>,
};

function renderQueryState(overrides: Partial<ComponentProps<typeof QueryState>> = {}) {
  return render(<QueryState {...defaultProps} {...overrides} />);
}

describe('QueryState', () => {
  it('shows an accessible loading status instead of children', () => {
    renderQueryState({ isLoading: true });

    expect(screen.getByRole('status', { name: 'Loading products' })).toBeVisible();
    expect(screen.queryByText('Product results')).not.toBeInTheDocument();
  });

  it('renders a caller-provided loading fallback', () => {
    renderQueryState({ isLoading: true, loadingFallback: <p>Product skeleton</p> });

    expect(screen.getByText('Product skeleton')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the error message and invokes retry when requested', () => {
    const onRetry = vi.fn();
    renderQueryState({ error: new Error('Catalog unavailable'), onRetry });

    expect(screen.getByRole('alert')).toHaveTextContent('Catalog unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.queryByText('Product results')).not.toBeInTheDocument();
  });

  it.each([new Error(''), 'untyped error'])('uses the fallback for an error without a message', (error) => {
    renderQueryState({ error });

    expect(screen.getByRole('alert')).toHaveTextContent('Please try again later.');
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('prefers a caller-provided error description', () => {
    renderQueryState({
      error: new Error('Internal error'),
      errorDescription: 'The catalog could not be reached.',
    });

    expect(screen.getByRole('alert')).toHaveTextContent('The catalog could not be reached.');
    expect(screen.getByRole('alert')).not.toHaveTextContent('Internal error');
  });

  it('renders children when there is no loading state or error', () => {
    renderQueryState();

    expect(screen.getByText('Product results')).toBeVisible();
  });
});
