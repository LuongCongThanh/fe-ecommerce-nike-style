import type { ReactNode } from 'react';

interface PageHeaderProps {
  readonly title: string;
  readonly action?: ReactNode;
}

/** Shared `<h1>` + optional trailing action (usually an "Add X" button) — every list page in admin
 * was reimplementing this row by hand with `text-xl font-bold`, one page drifting to `font-semibold`
 * (UI/UX audit finding #4/#6). */
export function PageHeader({ title, action }: PageHeaderProps): React.JSX.Element {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h1>
      {action}
    </div>
  );
}
