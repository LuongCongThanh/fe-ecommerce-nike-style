import { type VariantProps, cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';
import { focusRing } from '../lib/focusRing';

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 rounded-md text-label-md font-medium transition-colors duration-fast disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  {
    variants: {
      variant: {
        primary: 'bg-neutral-900 text-neutral-50 hover:bg-neutral-800',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        danger: 'bg-error-500 text-neutral-50 hover:bg-error-700',
        ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({ className, variant, size, loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} disabled={disabled ?? loading} {...props}>
      {children}
    </button>
  );
}
