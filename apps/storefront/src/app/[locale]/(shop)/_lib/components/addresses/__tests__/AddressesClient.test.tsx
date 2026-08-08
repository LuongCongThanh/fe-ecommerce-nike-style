import { resetMockAddressDbForTesting } from '@repo/api-sdk/mocks/address-fixtures';
import { registerAuthRuntimeAdapter } from '@repo/api-sdk/client/runtime';
import { encodeAccessToken } from '@repo/api-sdk/mocks/auth-fixtures';
import { server } from '@repo/api-sdk/testing/msw-server';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/__tests__/helpers/render';
import { AddressesClient } from '@/app/[locale]/(shop)/_lib/components/addresses/AddressesClient';

// Demo account (user id 1) seeded in `packages/api-sdk/src/mocks/address-fixtures.ts` with 1 default address.
const ACCOUNT_USER_ID = 1;

let unregister: (() => void) | undefined;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  unregister?.();
});
afterAll(() => server.close());

beforeEach(() => {
  resetMockAddressDbForTesting();
  unregister = registerAuthRuntimeAdapter({
    getAccessToken: () => encodeAccessToken({ sub: ACCOUNT_USER_ID, exp: Date.now() + 60_000 }),
    refreshSession: () => Promise.reject(new Error('not used in this test')),
  });
});

function fillAddressForm(form: HTMLElement, overrides: Partial<Record<'fullName' | 'phone' | 'province' | 'district' | 'ward' | 'detail', string>>) {
  const values = {
    fullName: 'Trần Thị B',
    phone: '0987654321',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Bến Nghé',
    detail: '456 Lê Lợi',
    ...overrides,
  };
  fireEvent.change(within(form).getByLabelText('Họ tên người nhận'), { target: { value: values.fullName } });
  fireEvent.change(within(form).getByLabelText('Số điện thoại'), { target: { value: values.phone } });
  fireEvent.change(within(form).getByLabelText('Tỉnh/Thành phố'), { target: { value: values.province } });
  fireEvent.change(within(form).getByLabelText('Quận/Huyện'), { target: { value: values.district } });
  fireEvent.change(within(form).getByLabelText('Phường/Xã'), { target: { value: values.ward } });
  fireEvent.change(within(form).getByLabelText('Địa chỉ chi tiết'), { target: { value: values.detail } });
}

describe('AddressesClient — address book CRUD (FE-INT, issue #15)', () => {
  it('lists the seeded default address', async () => {
    renderWithProviders(<AddressesClient />);
    expect(await screen.findByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Mặc định')).toBeInTheDocument();
  });

  it('creates a new address', async () => {
    renderWithProviders(<AddressesClient />);
    await screen.findByText('Nguyễn Văn A');

    fireEvent.click(screen.getByRole('button', { name: 'Thêm địa chỉ mới' }));
    const form = screen.getByRole('button', { name: 'Lưu địa chỉ' }).closest('form');
    expect(form).not.toBeNull();
    fillAddressForm(form as HTMLElement, {});

    fireEvent.click(screen.getByRole('button', { name: 'Lưu địa chỉ' }));

    await waitFor(() => expect(screen.getByText('Trần Thị B')).toBeInTheDocument());
    // The new address wasn't marked default, so the seed still is — exactly one "Mặc định" badge.
    expect(screen.getAllByText('Mặc định')).toHaveLength(1);
  });

  it('edits an existing address', async () => {
    renderWithProviders(<AddressesClient />);
    await screen.findByText('Nguyễn Văn A');

    fireEvent.click(screen.getByRole('button', { name: 'Sửa' }));
    const form = screen.getByRole('button', { name: 'Lưu địa chỉ' }).closest('form') as HTMLElement;
    fireEvent.change(within(form).getByLabelText('Họ tên người nhận'), { target: { value: 'Nguyễn Văn A (đã sửa)' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Lưu địa chỉ' }));

    await waitFor(() => expect(screen.getByText('Nguyễn Văn A (đã sửa)')).toBeInTheDocument());
  });

  it('deletes an address after confirming in the dialog', async () => {
    renderWithProviders(<AddressesClient />);
    await screen.findByText('Nguyễn Văn A');

    // Opens a confirm dialog instead of deleting immediately (destructive action guard).
    fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Xoá địa chỉ này?')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Xoá' }));

    await waitFor(() => expect(screen.getByText('Bạn chưa có địa chỉ nào.')).toBeInTheDocument());
  });

  it('cancels the delete dialog without deleting the address', async () => {
    renderWithProviders(<AddressesClient />);
    await screen.findByText('Nguyễn Văn A');

    fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
  });

  it('sets a non-default address as default', async () => {
    renderWithProviders(<AddressesClient />);
    await screen.findByText('Nguyễn Văn A');

    fireEvent.click(screen.getByRole('button', { name: 'Thêm địa chỉ mới' }));
    const form = screen.getByRole('button', { name: 'Lưu địa chỉ' }).closest('form') as HTMLElement;
    fillAddressForm(form, {});
    fireEvent.click(screen.getByRole('button', { name: 'Lưu địa chỉ' }));
    await screen.findByText('Trần Thị B');

    fireEvent.click(screen.getByRole('button', { name: 'Đặt làm mặc định' }));

    await waitFor(() => {
      const card = screen.getByText('Trần Thị B').closest('div.rounded-xl');
      expect(card).not.toBeNull();
      expect(within(card as HTMLElement).getByText('Mặc định')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Mặc định')).toHaveLength(1);
  });
});
