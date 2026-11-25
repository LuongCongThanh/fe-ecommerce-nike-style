import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageLoader } from '@/shared/ui/PageLoader';

describe('PageLoader', () => {
  it('exposes an accessible loading status', () => {
    render(<PageLoader />);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeVisible();
  });
});
