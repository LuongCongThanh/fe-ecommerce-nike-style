import { Input } from '@repo/ui/input';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useCustomerList } from '@/features/customers/useCustomerList';
import { DataTable } from '@/shell/DataTable';
import { PageHeader } from '@/shell/PageHeader';

export const Route = createFileRoute('/_authenticated/customers')({
  component: CustomersPage,
});

function CustomersPage(): React.JSX.Element {
  const { t } = useTranslation('customers');
  const list = useCustomerList();

  return (
    <div className="space-y-4">
      <PageHeader title={t('title')} />
      <p className="text-muted-foreground -mt-2 text-sm">{t('subtitle')}</p>

      <Input
        placeholder={t('searchPlaceholder')}
        value={list.search}
        onChange={(e) => {
          list.setSearch(e.target.value);
        }}
        className="max-w-sm"
      />

      <DataTable
        table={list.table}
        isLoading={false}
        isError={false}
        errorMessage=""
        isEmpty={list.pageItems.length === 0}
        emptyMessage={t('empty')}
        pagination={list.pagination}
      />
    </div>
  );
}
