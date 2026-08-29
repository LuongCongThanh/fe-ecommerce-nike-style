import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { createFileRoute } from '@tanstack/react-router';
import { Blocks } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { AppFilter } from '@/features/apps/useAppList';
import { useAppList } from '@/features/apps/useAppList';
import { PageHeader } from '@/shell/PageHeader';

export const Route = createFileRoute('/_authenticated/apps')({
  component: AppsPage,
});

function AppsPage(): React.JSX.Element {
  const { t } = useTranslation('apps');
  const list = useAppList();

  return (
    <div className="space-y-4">
      <PageHeader title={t('title')} />
      <p className="text-muted-foreground -mt-2 text-sm">{t('subtitle')}</p>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t('searchPlaceholder')}
          value={list.search}
          onChange={(e) => {
            list.setSearch(e.target.value);
          }}
          className="w-56"
        />
        <Select
          value={list.filter}
          onValueChange={(v) => {
            list.setFilter(v as AppFilter);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterAll')}</SelectItem>
            <SelectItem value="connected">{t('filterConnected')}</SelectItem>
            <SelectItem value="notConnected">{t('filterNotConnected')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {list.apps.length === 0 ? (
        <p className="text-muted-foreground p-6 text-center text-sm">{t('empty')}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.apps.map((app) => (
            <li key={app.id} className="rounded-lg border p-4 hover:shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <Blocks className="size-5" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={app.connected ? 'border-info-500 bg-info-50 text-info-700 hover:bg-info-50' : ''}
                  onClick={() => {
                    list.toggleConnected(app.id);
                  }}
                >
                  {app.connected ? t('connected') : t('connect')}
                </Button>
              </div>
              <h2 className="mb-1 font-semibold">{app.name}</h2>
              <p className="text-muted-foreground line-clamp-2 text-sm">{app.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
