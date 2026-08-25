// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
// Apple Design pass · §1 feedback on press, not release · §3 the selection ring is one shared
// element that travels · §14 reduced motion
'use client';

import { cn } from '@repo/shared/utils';
import { motion, useReducedMotion } from 'framer-motion';

import { SPRING_UI } from '@/shared/lib/motion';

interface VariantSelectorProps {
  readonly colors: string[];
  readonly sizes: string[];
  readonly selectedColor?: string;
  readonly selectedSize?: string;
  readonly onSelectColor: (color: string) => void;
  readonly onSelectSize: (size: string) => void;
}

interface VariantAxisProps {
  readonly title: string;
  readonly layoutId: string;
  readonly options: string[];
  readonly selected: string | undefined;
  readonly onSelect: (value: string) => void;
  readonly textCase: 'capitalize' | 'uppercase';
  readonly prefersReducedMotion: boolean;
}

function VariantAxis({ title, layoutId, options, selected, onSelect, textCase, prefersReducedMotion }: VariantAxisProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">{title}</h3>
        {selected !== undefined && <span className={cn('text-sm font-semibold', textCase)}>{selected}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <motion.button
            key={option}
            type="button"
            onClick={() => {
              onSelect(option);
            }}
            // Highlight lands on pointer-down, not on release — waiting for click feels dead.
            whileTap={{ scale: 0.95 }}
            transition={SPRING_UI}
            aria-pressed={selected === option}
            className={cn(
              'focus-visible:ring-ring relative min-w-13 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              textCase,
              selected === option ? 'border-transparent' : 'hover:border-foreground active:bg-muted',
            )}
          >
            {selected === option && (
              <motion.span
                layoutId={layoutId}
                transition={prefersReducedMotion ? { duration: 0 } : SPRING_UI}
                className="border-foreground pointer-events-none absolute inset-0 rounded-full border-2"
              />
            )}
            <span className="relative">{option}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
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
  const prefersReducedMotion = useReducedMotion() ?? false;

  if (colors.length === 0 && sizes.length === 0) return null;

  return (
    <div className="space-y-5">
      {colors.length > 0 && (
        <VariantAxis
          title="Màu sắc"
          layoutId="variant-axis-color"
          options={colors}
          selected={selectedColor}
          onSelect={onSelectColor}
          textCase="capitalize"
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {sizes.length > 0 && (
        <VariantAxis
          title="Kích thước"
          layoutId="variant-axis-size"
          options={sizes}
          selected={selectedSize}
          onSelect={onSelectSize}
          textCase="uppercase"
          prefersReducedMotion={prefersReducedMotion}
        />
      )}
    </div>
  );
}
