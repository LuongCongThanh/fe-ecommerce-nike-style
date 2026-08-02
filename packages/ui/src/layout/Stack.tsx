import { type VariantProps, cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

const stackVariants = cva('flex flex-col', {
  variants: {
    gap: { 0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 6: 'gap-6', 8: 'gap-8' },
  },
  defaultVariants: { gap: 4 },
});

export interface StackProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {}

export function Stack({ className, gap, ...props }: StackProps) {
  return <div className={cn(stackVariants({ gap }), className)} {...props} />;
}
