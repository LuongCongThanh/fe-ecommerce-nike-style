import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/Sheet';

function renderSheet(side?: 'top' | 'right' | 'bottom' | 'left') {
  return render(
    <Sheet>
      <SheetTrigger>Open sheet</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Dismiss</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>,
  );
}

describe('Sheet', () => {
  it('opens as a dialog from the trigger and closes via SheetClose', async () => {
    const user = userEvent.setup();
    renderSheet();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open sheet' }));

    expect(screen.getByRole('dialog', { name: 'Sheet title' })).toBeVisible();
    expect(screen.getByText('Sheet description')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each(['top', 'bottom', 'left', 'right'] as const)('opens when anchored to the %s edge', async (side) => {
    const user = userEvent.setup();
    renderSheet(side);

    await user.click(screen.getByRole('button', { name: 'Open sheet' }));

    expect(screen.getByRole('dialog', { name: 'Sheet title' })).toBeVisible();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole('button', { name: 'Open sheet' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
