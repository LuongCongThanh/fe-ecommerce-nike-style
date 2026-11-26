import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/shared/components/Select';

beforeAll(() => {
  // jsdom thiếu các API Radix Select cần khi mở popper.
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
});

function renderSelect(onValueChange = vi.fn()) {
  render(
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Size" size="sm">
        <SelectValue placeholder="Pick a size" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sizes</SelectLabel>
          <SelectItem value="s">Small</SelectItem>
          <SelectSeparator />
          <SelectItem value="m">Medium</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>,
  );
  return onValueChange;
}

describe('Select', () => {
  it('shows the placeholder before a value is chosen', () => {
    renderSelect();

    expect(screen.getByRole('combobox', { name: 'Size' })).toHaveTextContent('Pick a size');
  });

  it('opens the listbox and reports the chosen value', async () => {
    const user = userEvent.setup();
    const onValueChange = renderSelect();

    await user.click(screen.getByRole('combobox', { name: 'Size' }));
    expect(screen.getByRole('listbox')).toBeVisible();
    expect(screen.getByText('Sizes')).toBeVisible();

    await user.click(screen.getByRole('option', { name: 'Medium' }));

    expect(onValueChange).toHaveBeenCalledWith('m');
    expect(screen.getByRole('combobox', { name: 'Size' })).toHaveTextContent('Medium');
  });
});
