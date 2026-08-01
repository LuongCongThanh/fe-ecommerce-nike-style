'use client';

import { Minus, Plus } from 'lucide-react';

import { Button } from '@/shared/components/base/button';
import { cn } from '@/shared/lib/utils';

interface QuantitySelectorProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly className?: string;
}

export function QuantitySelector({ value, onChange, min = 1, max = Number.POSITIVE_INFINITY, className }: QuantitySelectorProps) {
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <div className={cn('inline-flex items-center rounded-lg border', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-r-none"
        onClick={() => {
          onChange(Math.max(min, value - 1));
        }}
        disabled={!canDecrease}
        aria-label="Giảm số lượng"
      >
        <Minus className="size-4" />
      </Button>
      <span className="min-w-12 px-3 text-center text-sm font-medium">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-l-none"
        onClick={() => {
          onChange(Math.min(max, value + 1));
        }}
        disabled={!canIncrease}
        aria-label="Tăng số lượng"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
