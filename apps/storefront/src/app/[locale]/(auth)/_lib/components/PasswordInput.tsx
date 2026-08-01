'use client';

import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button } from '@/shared/components/base/button';
import { Input } from '@/shared/components/base/input';
import { cn } from '@/shared/lib/utils';

type PasswordInputProps = ComponentProps<typeof Input>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={cn('pr-10', className)} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-1 size-8 -translate-y-1/2"
        onClick={() => {
          setVisible((current) => !current);
        }}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}
