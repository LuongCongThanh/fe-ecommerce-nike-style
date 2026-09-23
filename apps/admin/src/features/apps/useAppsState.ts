import { MOCK_APPS } from '@/features/apps/mock-data';
import type { AppIntegration } from '@/features/apps/types';
import { useLocalCollection } from '@/shell/useLocalCollection';

export interface AppsState {
  readonly apps: AppIntegration[];
  readonly toggleConnected: (id: string) => void;
}

/** Real toggle, `localStorage`-persisted — the shadcn-admin original's "Connect" button has no
 * `onClick` at all (decorative); this one actually flips state instead of pretending to. */
export function useAppsState(): AppsState {
  const apps = useLocalCollection<AppIntegration>('admin.apps', MOCK_APPS);

  return {
    apps: apps.items,
    toggleConnected: (id) => {
      const app = apps.items.find((candidate) => candidate.id === id);
      if (app === undefined) return;
      apps.patch(id, { connected: !app.connected });
    },
  };
}
