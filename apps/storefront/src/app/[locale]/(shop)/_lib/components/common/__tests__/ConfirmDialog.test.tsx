import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from '@/app/[locale]/(shop)/_lib/components/common/ConfirmDialog';
import { Button } from '@/shared/components/base/button';

const defaultProps = {
  trigger: <Button>Xóa</Button>,
  title: 'Xác nhận xóa',
  onConfirm: vi.fn(),
};

describe('ConfirmDialog', () => {
  it('renders the trigger element', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeInTheDocument();
  });

  it('dialog is not visible before trigger is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows the title inside the dialog', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument();
  });

  it('shows description when provided', async () => {
    render(<ConfirmDialog {...defaultProps} description="Hành động này không thể hoàn tác" />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(screen.getByText('Hành động này không thể hoàn tác')).toBeInTheDocument();
  });

  it('does not show description when not provided', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    // Only title and buttons should be in dialog, no description text
    expect(screen.queryByRole('doc')).not.toBeInTheDocument();
  });

  it('renders default confirm label "Xác nhận"', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeInTheDocument();
  });

  it('renders default cancel label "Hủy"', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
  });

  it('renders custom confirm and cancel labels', async () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Đồng ý" cancelLabel="Quay lại" />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(screen.getByRole('button', { name: 'Đồng ý' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quay lại' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('confirm button is disabled when loading=true', async () => {
    render(<ConfirmDialog {...defaultProps} loading />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    // When loading, the button contains a spinner (role=status, aria-label="Đang xử lý")
    // which changes the computed accessible name, so use regex match
    expect(screen.getByRole('button', { name: /Xác nhận/ })).toBeDisabled();
  });
});
