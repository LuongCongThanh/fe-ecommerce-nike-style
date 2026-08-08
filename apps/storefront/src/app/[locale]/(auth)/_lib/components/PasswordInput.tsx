'use client';

import { useState } from 'react';

import { cn } from '@repo/shared/utils';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps } from 'react';

type PasswordInputProps = ComponentProps<typeof Input>;

export function PasswordInput({ className, id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  // FormControl (shadcn Form) wires `id` to a FormLabel via Slot when this is used inside a form field.
  // Fall back to a default label so the input also has an accessible name when used standalone.
  const hasExternalLabel = id !== undefined || ariaLabel !== undefined || ariaLabelledBy !== undefined;

  return (
    <div className="relative">
      <Input
        {...props}
        id={id}
        aria-label={hasExternalLabel ? ariaLabel : 'Mật khẩu'}
        aria-labelledby={ariaLabelledBy}
        type={visible ? 'text' : 'password'}
        className={cn('pr-10', className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-1 size-8 -translate-y-1/2"
        onClick={() => {
          setVisible((current) => !current);
        }}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}
