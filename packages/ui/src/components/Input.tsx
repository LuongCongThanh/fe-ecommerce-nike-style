import { type VariantProps, cva } from 'class-variance-authority';
import type { InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';
import { focusRing } from '../lib/focusRing';

const inputVariants = cva(
  `w-full rounded-md border bg-background px-3 text-body-md text-foreground placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`,
  {
    variants: {
      state: {
        default: 'border-neutral-200',
        error: 'border-error-500',
      },
      inputSize: {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-12',
      },
    },
    defaultVariants: { state: 'default', inputSize: 'md' },
  },
);

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {}

export function Input({ className, state, inputSize, ...props }: InputProps) {
  return <input className={cn(inputVariants({ state, inputSize }), className)} aria-invalid={state === 'error' || undefined} {...props} />;
}
