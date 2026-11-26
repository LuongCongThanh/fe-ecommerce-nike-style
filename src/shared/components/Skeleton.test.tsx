import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from '@/shared/components/Skeleton';

describe('Skeleton', () => {
  it('renders a pulsing placeholder and merges the given class and props', () => {
    const { container } = render(<Skeleton className="h-4 w-10" id="sk" />);

    const el = container.querySelector('[data-slot="skeleton"]');
    expect(el).toHaveClass('animate-pulse', 'h-4', 'w-10');
    expect(el).toHaveAttribute('id', 'sk');
  });
});
