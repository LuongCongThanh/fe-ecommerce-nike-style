import { useState } from 'react';

import type { AppIntegration } from '@/features/apps/types';
import { useAppsState } from '@/features/apps/useAppsState';
import { filterBySearch } from '@/shell/filterBySearch';

export type AppFilter = 'all' | 'connected' | 'notConnected';

export interface AppListModel {
  readonly apps: AppIntegration[];
  readonly toggleConnected: (id: string) => void;
  readonly search: string;
  readonly setSearch: (value: string) => void;
  readonly filter: AppFilter;
  readonly setFilter: (value: AppFilter) => void;
}

/** The integrations list behind one interface: persisted state, connection filter and name search. */
export function useAppList(): AppListModel {
  const { apps, toggleConnected } = useAppsState();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AppFilter>('all');

  const byConnection = apps.filter((app) => {
    if (filter === 'all') return true;
    return filter === 'connected' ? app.connected : !app.connected;
  });

  return {
    apps: filterBySearch(byConnection, search, [(app) => app.name]),
    toggleConnected,
    search,
    setSearch,
    filter,
    setFilter,
  };
}
