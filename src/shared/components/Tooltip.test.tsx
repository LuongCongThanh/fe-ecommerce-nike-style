import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/Tooltip';

describe('Tooltip', () => {
  it('shows its content when the trigger receives keyboard focus', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Helpful hint</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument();

    await user.tab();

    expect((await screen.findAllByText('Helpful hint')).length).toBeGreaterThan(0);
  });

  it('merges a custom class on the content when opened by default', () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="custom-tip">Open hint</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(document.querySelector('[data-slot="tooltip-content"]')).toHaveClass('custom-tip');
  });
});
