'use client';

import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import { getCategories } from '@repo/api-sdk/endpoints/catalog';
import type { Gender, Product, ProductInput, SkuInput } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

const GENDERS: Gender[] = ['men', 'women', 'kids', 'unisex'];

interface SkuRow extends SkuInput {
  readonly key: string;
}

function toRows(skus: Product['skus']): SkuRow[] {
  return skus.map((s) => ({ key: s.id, id: s.id, price: s.price, stock: s.stock, color: s.color, size: s.size }));
}

function emptyRow(): SkuRow {
  return { key: crypto.randomUUID(), price: 0, stock: 0, color: null, size: null };
}

interface ProductFormProps {
  readonly initial?: Product;
  readonly submitLabel: string;
  readonly isSubmitting: boolean;
  readonly errorMessage: string | null;
  readonly onSubmit: (input: ProductInput) => void;
}

export function ProductForm({ initial, submitLabel, isSubmitting, errorMessage, onSubmit }: ProductFormProps): React.JSX.Element {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { data: categoriesData } = useQuery({ queryKey: ['admin', 'categories'], queryFn: getCategories });
  const categories = categoriesData?.data ?? [];

  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'unisex');
  const [rows, setRows] = useState<SkuRow[]>(initial !== undefined ? toRows(initial.skus) : [emptyRow()]);

  const addRow = (): void => {
    setRows((r) => [...r, emptyRow()]);
  };

  const removeRow = (key: string): void => {
    setRows((r) => (r.length <= 1 ? r : r.filter((row) => row.key !== key)));
  };

  const updateRow = (key: string, patch: Partial<SkuRow>): void => {
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit({
      slug,
      name,
      description,
      images: initial?.images ?? [],
      categoryId,
      gender,
      skus: rows.map((r) => ({
        id: r.id,
        price: r.price,
        stock: r.stock,
        color: r.color !== '' ? r.color : null,
        size: r.size !== '' ? r.size : null,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage !== null ? (
        <p role="alert" className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t('fields.name')}</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">{t('fields.slug')}</Label>
          <Input
            id="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t('fields.description')}</Label>
        <textarea
          id="description"
          required
          rows={3}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">{t('fields.category')}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder={t('fields.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gender">{t('fields.gender')}</Label>
          <Select
            value={gender}
            onValueChange={(v) => {
              setGender(v as Gender);
            }}
          >
            <SelectTrigger id="gender" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {t(`genders.${g}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t('fields.variantsSection')}</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            {t('fields.addVariant')}
          </Button>
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-2 rounded-lg border p-3">
              <div className="space-y-1">
                <Label htmlFor={`color-${row.key}`} className="text-xs">
                  {t('fields.color')}
                </Label>
                <Input
                  id={`color-${row.key}`}
                  value={row.color ?? ''}
                  onChange={(e) => {
                    updateRow(row.key, { color: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`size-${row.key}`} className="text-xs">
                  {t('fields.size')}
                </Label>
                <Input
                  id={`size-${row.key}`}
                  value={row.size ?? ''}
                  onChange={(e) => {
                    updateRow(row.key, { size: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`price-${row.key}`} className="text-xs">
                  {t('fields.price')}
                </Label>
                <Input
                  id={`price-${row.key}`}
                  type="number"
                  min={0}
                  required
                  value={row.price}
                  onChange={(e) => {
                    updateRow(row.key, { price: Number(e.target.value) });
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`stock-${row.key}`} className="text-xs">
                  {t('fields.stock')}
                </Label>
                <Input
                  id={`stock-${row.key}`}
                  type="number"
                  min={0}
                  required
                  value={row.stock}
                  onChange={(e) => {
                    updateRow(row.key, { stock: Number(e.target.value) });
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('fields.removeVariant')}
                disabled={rows.length <= 1}
                onClick={() => {
                  removeRow(row.key);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tCommon('actions.saving') : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.push('/products');
          }}
        >
          {tCommon('actions.cancel')}
        </Button>
      </div>
    </form>
  );
}
