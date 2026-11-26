import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getAccountOrder } from '@/integrations/backend/mocks/order-fixtures';

import { CheckoutSuccess } from '@/modules/checkout/components/CheckoutSuccess';
import { renderWithProviders } from '@/testing/render';

// Demo account (user id 1), order 1002 is seeded in order-fixtures.ts.
const order = getAccountOrder(1, 1002);
if (order === undefined) throw new Error('seeded order 1002 missing');

describe('CheckoutSuccess', () => {
  it('shows the order code, lines and links when the order was readable', () => {
    renderWithProviders(<CheckoutSuccess locale="vi" orderId="1002" order={order} />);

    expect(screen.getByText(`Mã đơn hàng: #${order.code}`)).toBeInTheDocument();
    expect(screen.getByText('Địa chỉ giao hàng')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem đơn hàng' })).toHaveAttribute('href', '/vi/account/orders');
    expect(screen.getByRole('link', { name: 'Tiếp tục mua sắm' })).toHaveAttribute('href', '/vi/products');
  });

  it('falls back to the orderId from the URL when the order could not be read', () => {
    renderWithProviders(<CheckoutSuccess locale="vi" orderId="1002" order={null} />);

    expect(screen.getByText('Mã đơn hàng: #1002')).toBeInTheDocument();
    expect(screen.queryByText('Địa chỉ giao hàng')).not.toBeInTheDocument();
  });

  it('shows no order reference when there is neither an order nor an orderId', () => {
    renderWithProviders(<CheckoutSuccess locale="vi" orderId={undefined} order={null} />);

    expect(screen.getByText('Đặt hàng thành công!')).toBeInTheDocument();
    expect(screen.queryByText(/Mã đơn hàng/)).not.toBeInTheDocument();
  });
});
