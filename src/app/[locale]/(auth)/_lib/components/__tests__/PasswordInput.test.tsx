import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PasswordInput } from '@/app/[locale]/(auth)/_lib/components/PasswordInput';

describe('PasswordInput', () => {
  it('renders input with type password by default', () => {
    render(<PasswordInput />);
    expect(document.querySelector('input')).toHaveAttribute('type', 'password');
  });

  it('toggle button has aria-label "Hiện mật khẩu" initially', () => {
    render(<PasswordInput />);
    expect(screen.getByRole('button', { name: 'Hiện mật khẩu' })).toBeInTheDocument();
  });

  it('clicking toggle reveals password — input type becomes text', async () => {
    render(<PasswordInput />);
    await userEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('toggle button aria-label changes to "Ẩn mật khẩu" when visible', async () => {
    render(<PasswordInput />);
    await userEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
    expect(screen.getByRole('button', { name: 'Ẩn mật khẩu' })).toBeInTheDocument();
  });

  it('clicking toggle twice reverts input type to password', async () => {
    render(<PasswordInput />);
    await userEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
    expect(document.querySelector('input')).toHaveAttribute('type', 'password');
  });

  it('forwards placeholder prop to underlying input', () => {
    render(<PasswordInput placeholder="Nhập mật khẩu" />);
    expect(screen.getByPlaceholderText('Nhập mật khẩu')).toBeInTheDocument();
  });
});
