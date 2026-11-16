import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from '@/shared/ui/Pagination';

const LABELS = {
  previousLabel: 'Previous page',
  nextLabel: 'Next page',
  navigationLabel: 'Pagination',
};

function renderPagination(currentPage: number, totalPages: number) {
  const onPageChange = vi.fn();
  const view = render(<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} {...LABELS} />);
  return { ...view, onPageChange };
}

describe('Pagination', () => {
  it.each([0, 1])('renders nothing when totalPages is %i', (totalPages) => {
    const { container } = renderPagination(1, totalPages);

    expect(container).toBeEmptyDOMElement();
  });

  it('exposes a navigation landmark with the given label', () => {
    renderPagination(1, 3);

    const navigation = screen.getByRole('navigation', { name: 'Pagination' });

    expect(navigation).toBeInTheDocument();
    expect(navigation).toHaveClass('flex-wrap');
  });

  it('shows every page when there are few pages', () => {
    renderPagination(1, 3);

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['', '1', '2', '3', '']);
  });

  it('collapses 20 pages into a window with two hidden ellipses', () => {
    const { container } = renderPagination(10, 20);

    const buttons = screen.getAllByRole('button');
    const ellipses = container.querySelectorAll('[aria-hidden="true"]:not(svg)');

    expect(buttons.map((button) => button.textContent)).toEqual(['', '1', '9', '10', '11', '20', '']);
    expect(ellipses).toHaveLength(2);
    expect(buttons.length + ellipses.length).toBeLessThanOrEqual(9);
  });

  it('marks only the current page with aria-current="page"', () => {
    renderPagination(10, 20);

    expect(screen.getByRole('button', { name: '10' })).toHaveAttribute('aria-current', 'page');
    for (const name of ['1', '9', '11', '20']) {
      expect(screen.getByRole('button', { name })).not.toHaveAttribute('aria-current');
    }
  });

  it('disables the previous button on the first page', () => {
    renderPagination(1, 20);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('disables the next button on the last page', () => {
    renderPagination(20, 20);

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
  });

  it('calls onPageChange with the clicked page number', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination(10, 20);

    await user.click(screen.getByRole('button', { name: '11' }));

    expect(onPageChange).toHaveBeenCalledWith(11);
  });

  it.each([
    { name: 'Previous page', expected: 9 },
    { name: 'Next page', expected: 11 },
  ])('calls onPageChange with $expected from "$name"', async ({ name, expected }) => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination(10, 20);

    await user.click(screen.getByRole('button', { name }));

    expect(onPageChange).toHaveBeenCalledWith(expected);
  });

  it('skips the ellipses when tabbing through the controls', async () => {
    const user = userEvent.setup();
    renderPagination(10, 20);
    const buttons = screen.getAllByRole('button');

    for (const button of buttons) {
      await user.tab();
      expect(button).toHaveFocus();
    }
  });
});
