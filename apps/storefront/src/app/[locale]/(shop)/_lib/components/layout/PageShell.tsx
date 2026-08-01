import { cva } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

const containerVariants = cva('mx-auto px-4', {
  variants: {
    width: {
      form: 'max-w-lg',
      list: 'max-w-3xl',
      browse: 'max-w-7xl',
    },
  },
});

interface ShellSlotProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

function Form({ children, className }: ShellSlotProps): React.JSX.Element {
  return <div className={cn(containerVariants({ width: 'form' }), 'py-8', className)}>{children}</div>;
}

function List({ children, className }: ShellSlotProps): React.JSX.Element {
  return <div className={cn(containerVariants({ width: 'list' }), 'py-8', className)}>{children}</div>;
}

function Browse({ children, className }: ShellSlotProps): React.JSX.Element {
  return <div className={cn(containerVariants({ width: 'browse' }), 'py-8', className)}>{children}</div>;
}

interface SplitProps {
  readonly children: React.ReactNode;
  readonly sidebar: React.ReactNode;
  readonly className?: string;
}

function Split({ children, sidebar, className }: SplitProps): React.JSX.Element {
  return (
    <div className={cn('relative min-h-screen pt-8 pb-20', className)}>
      <div className={containerVariants({ width: 'browse' })}>
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <div>{children}</div>
          <div className="relative">{sidebar}</div>
        </div>
      </div>
    </div>
  );
}

export const PageShell = { Form, List, Browse, Split };
