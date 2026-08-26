'use client';

import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';

import type { Category, CategoryInput } from '@repo/schemas/catalog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';

const NO_PARENT_VALUE = '__none__';

interface CategoryFormProps {
  readonly initial?: Category;
  readonly categories: Category[];
  readonly submitLabel: string;
  readonly isSubmitting: boolean;
  readonly errorMessage: string | null;
  readonly onSubmit: (input: CategoryInput) => void;
}

export function CategoryForm({ initial, categories, submitLabel, isSubmitting, errorMessage, onSubmit }: CategoryFormProps): React.JSX.Element {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [parentId, setParentId] = useState(initial?.parentId ?? NO_PARENT_VALUE);

  // A category can't be its own parent — exclude itself from the picker (the mock server also
  // rejects setting itself or a descendant as parent, this just keeps the obvious case out of the UI).
  const parentOptions = categories.filter((c) => c.id !== initial?.id);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit({
      slug,
      name,
      parentId: parentId === NO_PARENT_VALUE ? null : parentId,
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
          <Label htmlFor="name">Tên danh mục</Label>
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
          <Label htmlFor="slug">Slug</Label>
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
        <Label htmlFor="parent">Danh mục cha</Label>
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger id="parent" className="w-full">
            <SelectValue placeholder="Không có (danh mục gốc)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PARENT_VALUE}>Không có (danh mục gốc)</SelectItem>
            {parentOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.push('/categories');
          }}
        >
          Huỷ
        </Button>
      </div>
    </form>
  );
}
