import { type VariantProps, cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

const gridVariants = cva('grid gap-4', {
  variants: {
    cols: {
      2: 'grid-cols-2',
      3: 'grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    },
  },
  defaultVariants: { cols: 4 },
});

export interface GridProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {}

export function Grid({ className, cols, ...props }: GridProps) {
  return <div className={cn(gridVariants({ cols }), className)} {...props} />;
}
