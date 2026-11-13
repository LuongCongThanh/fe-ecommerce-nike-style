import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { QuantitySelector } from '@/app/[locale]/(shop)/_lib/components/common/QuantitySelector';

describe('QuantitySelector', () => {
  it('renders the current value', () => {
    render(<QuantitySelector value={3} onChange={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('decrease button is disabled when value equals min', () => {
    render(<QuantitySelector value={1} onChange={vi.fn()} min={1} />);
    expect(screen.getByRole('button', { name: 'Giảm số lượng' })).toBeDisabled();
  });

  it('increase button is disabled when value equals max', () => {
    render(<QuantitySelector value={5} onChange={vi.fn()} max={5} />);
    expect(screen.getByRole('button', { name: 'Tăng số lượng' })).toBeDisabled();
  });

  it('decrease button is enabled when value is above min', () => {
    render(<QuantitySelector value={2} onChange={vi.fn()} min={1} />);
    expect(screen.getByRole('button', { name: 'Giảm số lượng' })).not.toBeDisabled();
  });

  it('increase button is enabled when value is below max', () => {
    render(<QuantitySelector value={4} onChange={vi.fn()} max={5} />);
    expect(screen.getByRole('button', { name: 'Tăng số lượng' })).not.toBeDisabled();
  });

  it('calls onChange with value - 1 when decrease is clicked', async () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={3} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Giảm số lượng' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with value + 1 when increase is clicked', async () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={3} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Tăng số lượng' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('clamps decrease at min', async () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={2} onChange={onChange} min={2} />);
    // button is disabled at min, so we test min+1 scenario
    render(<QuantitySelector value={3} onChange={onChange} min={3} />);
    // value=3=min → disabled
    const btns = screen.getAllByRole('button', { name: 'Giảm số lượng' });
    expect(btns.at(-1)).toBeDisabled();
  });

  it('clamps increase at max', async () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={10} onChange={onChange} max={10} />);
    expect(screen.getAllByRole('button', { name: 'Tăng số lượng' }).at(-1)).toBeDisabled();
  });
});
