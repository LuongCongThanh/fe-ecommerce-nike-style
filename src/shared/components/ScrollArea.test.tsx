import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScrollArea, ScrollBar } from '@/shared/components/ScrollArea';

describe('ScrollArea', () => {
  it('renders children inside a viewport and merges className on the root', () => {
    const { container } = render(
      <ScrollArea className="h-20">
        <p>scrollable</p>
      </ScrollArea>,
    );

    expect(screen.getByText('scrollable').closest('[data-slot="scroll-area-viewport"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="scroll-area"]')).toHaveClass('relative', 'h-20');
  });

  it('accepts extra scrollbars for both orientations', () => {
    const { container } = render(
      <ScrollArea>
        <ScrollBar orientation="horizontal" className="custom" />
        <ScrollBar />
      </ScrollArea>,
    );

    expect(container.querySelector('[data-slot="scroll-area"]')).not.toBeNull();
  });
});
