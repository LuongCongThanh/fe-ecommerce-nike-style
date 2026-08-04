'use client';

import { getProducts } from '@repo/api-sdk/endpoints/catalog';
import type { Product } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Skeleton } from '@repo/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

export function ProductsSummary() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'products-summary'],
    queryFn: () => getProducts(),
  });
  const products = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Sản phẩm</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void refetch();
          }}
        >
          Tải lại
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
            Không tải được danh sách sản phẩm. Vui lòng thử lại.
          </p>
        ) : null}

        {!isLoading && products.length === 0 ? <p className="text-muted-foreground text-sm">Chưa có sản phẩm nào.</p> : null}

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
