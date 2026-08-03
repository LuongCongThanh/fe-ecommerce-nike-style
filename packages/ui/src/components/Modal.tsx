'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '../lib/cn';
import { focusRing } from '../lib/focusRing';

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;

export function ModalContent({ className, children, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="z-modal fixed inset-0 bg-neutral-900/50" />
      <DialogPrimitive.Content
        className={cn(
          'z-modal bg-background fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 shadow-lg',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={cn('absolute top-4 right-4 rounded-sm', focusRing)}>
          <X size={20} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const ModalTitle = DialogPrimitive.Title;
export const ModalDescription = DialogPrimitive.Description;

