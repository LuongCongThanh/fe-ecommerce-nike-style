import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NewsletterForm } from '@/app/[locale]/(shop)/_lib/components/home/NewsletterForm';

describe('NewsletterForm', () => {
  it('renders submit button with default label', () => {
    render(<NewsletterForm />);
    expect(screen.getByRole('button', { name: 'Đăng ký' })).toBeInTheDocument();
  });

  it('renders submit button with custom submitLabel', () => {
    render(<NewsletterForm submitLabel="Subscribe" />);
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<NewsletterForm title="Nhận ưu đãi" />);
    expect(screen.getByText('Nhận ưu đãi')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    render(<NewsletterForm />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<NewsletterForm description="Đăng ký để nhận tin mới nhất" />);
    expect(screen.getByText('Đăng ký để nhận tin mới nhất')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<NewsletterForm />);
    // Only the form and button should be present, no description paragraph
    expect(screen.queryByText(/nhận tin/i)).not.toBeInTheDocument();
  });

  it('shows success message after form is submitted', async () => {
    render(<NewsletterForm />);
    await userEvent.type(screen.getByLabelText('Địa chỉ email'), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));
    expect(screen.getByText('Đăng ký thành công!')).toBeInTheDocument();
  });

  it('calls onSubmit with the entered email', async () => {
    const onSubmit = vi.fn();
    render(<NewsletterForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Địa chỉ email'), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));
    expect(onSubmit).toHaveBeenCalledWith('user@example.com');
  });

  it('hides the form after successful submit', async () => {
    render(<NewsletterForm />);
    await userEvent.type(screen.getByLabelText('Địa chỉ email'), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đăng ký' })).not.toBeInTheDocument();
  });
});
