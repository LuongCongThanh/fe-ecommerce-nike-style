// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
'use client';

import { cn } from '@repo/shared/utils';

interface VariantSelectorProps {
  readonly colors: string[];
  readonly sizes: string[];
  readonly selectedColor?: string;
  readonly selectedSize?: string;
  readonly onSelectColor: (color: string) => void;
  readonly onSelectSize: (size: string) => void;
}

/** Two independent Variant axes (Color, Size) — a Product may have either, both, or neither (glossary.md — Variant is `{Color?, Size?}`). */
export function VariantSelector({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
}: VariantSelectorProps): React.JSX.Element | null {
  if (colors.length === 0 && sizes.length === 0) return null;

  return (
    <div className="space-y-5">
      {colors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Màu sắc</h3>
            {selectedColor !== undefined && <span className="text-sm font-semibold capitalize">{selectedColor}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onSelectColor(color);
                }}
                aria-pressed={selectedColor === color}
                className={cn(
                  'focus-visible:ring-ring min-w-13 rounded-full border px-4 py-2.5 text-sm font-medium capitalize transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  selectedColor === color ? 'border-foreground ring-foreground ring-1' : 'hover:border-foreground active:bg-muted',
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">Kích thước</h3>
            {selectedSize !== undefined && <span className="text-sm font-semibold uppercase">{selectedSize}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  onSelectSize(size);
                }}
                aria-pressed={selectedSize === size}
                className={cn(
                  'min-w-13 rounded-full border px-4 py-2.5 text-sm font-medium uppercase transition-colors duration-150',
                  selectedSize === size ? 'border-foreground ring-foreground ring-1' : 'hover:border-foreground',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
