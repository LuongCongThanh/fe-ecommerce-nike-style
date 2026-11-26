import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/shared/components/Popover';

describe('Popover', () => {
  it('opens its content when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverAnchor>
          <PopoverTrigger>Open</PopoverTrigger>
        </PopoverAnchor>
        <PopoverContent className="custom-pop">
          <PopoverHeader>
            <PopoverTitle>Title</PopoverTitle>
            <PopoverDescription>Description</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>,
    );

    expect(screen.queryByText('Title')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByText('Title')).toBeVisible();
    expect(screen.getByText('Description')).toBeVisible();
    expect(document.querySelector('[data-slot="popover-content"]')).toHaveClass('custom-pop');
  });
});
