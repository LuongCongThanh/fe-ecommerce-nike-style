import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import type { Product } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Skeleton } from '@repo/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export function ProductsSummary(): React.JSX.Element {
  const { t } = useTranslation('common');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'products-summary'],
    queryFn: () => getProducts(),
  });
  const products = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t('dashboard.productsCardTitle')}</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void refetch();
          }}
        >
          {t('actions.reload')}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
          </div>
        ) : null}

        {isError ? (
          <p className="text-destructive text-sm" role="alert">
            {t('dashboard.loadError')}
          </p>
        ) : null}

        {!isLoading && products.length === 0 ? <p className="text-muted-foreground text-sm">{t('dashboard.empty')}</p> : null}

        {products.length > 0 ? (
          <ul className="divide-border divide-y">
            {products.map((product: Product) => (
              <li key={product.id} className="text-foreground py-2 text-sm">
                {product.name}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
