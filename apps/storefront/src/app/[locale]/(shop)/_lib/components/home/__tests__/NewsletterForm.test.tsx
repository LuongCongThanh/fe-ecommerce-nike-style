import { render, screen, waitFor } from '@testing-library/react';
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
    // The form <-> success swap now crossfades (AnimatePresence mode="wait"), so the success
    // copy only mounts once the outgoing form's exit transition finishes.
    expect(await screen.findByText('Đăng ký thành công!')).toBeInTheDocument();
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
    // The form's exit transition (AnimatePresence mode="wait") keeps it mounted briefly, so
    // wait for it to finish unmounting instead of asserting synchronously.
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Đăng ký' })).not.toBeInTheDocument();
    });
  });

  describe('email validation (homepage-improvement-plan.md P1-5)', () => {
    it('shows an inline error and does not submit when the email is empty', async () => {
      render(<NewsletterForm />);
      await userEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));

      expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng nhập một địa chỉ email hợp lệ.');
      expect(screen.getByLabelText('Địa chỉ email')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.queryByText('Đăng ký thành công!')).not.toBeInTheDocument();
    });

    it('shows an inline error and does not call onSubmit when the email is malformed', async () => {
      const onSubmit = vi.fn();
      render(<NewsletterForm onSubmit={onSubmit} />);
      await userEvent.type(screen.getByLabelText('Địa chỉ email'), 'not-an-email');
      await userEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));

      expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng nhập một địa chỉ email hợp lệ.');
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('clears the error once the visitor edits the email again', async () => {
      render(<NewsletterForm />);
      await userEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText('Địa chỉ email'), 'u');

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Địa chỉ email')).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
