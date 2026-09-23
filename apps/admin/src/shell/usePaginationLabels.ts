import { useTranslation } from 'react-i18next';

import type { ClientDataTablePaginationLabels } from '@/shell/useClientDataTablePagination';

/**
 * The `pageOf`/`previous`/`next` label triple every list page hands to
 * `useClientDataTablePagination`. It is a pure function of the `common` namespace, so each list page
 * was rebuilding the identical object inline; this owns it once instead.
 */
export function usePaginationLabels(): ClientDataTablePaginationLabels {
  const { t: tCommon } = useTranslation('common');

  return {
    pageOf: (page, totalPages) => tCommon('pagination.pageOf', { page, totalPages }),
    previous: tCommon('pagination.previous'),
    next: tCommon('pagination.next'),
  };
}
