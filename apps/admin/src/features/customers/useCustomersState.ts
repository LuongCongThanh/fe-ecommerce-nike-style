import { MOCK_CUSTOMERS } from '@/features/customers/mock-data';
import type { Customer, CustomerStatus } from '@/features/customers/types';
import { useLocalCollection } from '@/shell/useLocalCollection';

export interface CustomersState {
  readonly customers: Customer[];
  readonly setStatus: (id: string, status: CustomerStatus) => void;
}

/** Local-only (`localStorage`, seeded from `MOCK_CUSTOMERS`) — see `types.ts` for why. */
export function useCustomersState(): CustomersState {
  const customers = useLocalCollection<Customer>('admin.customers', MOCK_CUSTOMERS);

  return {
    customers: customers.items,
    setStatus: (id, status) => {
      customers.patch(id, { status });
    },
  };
}
