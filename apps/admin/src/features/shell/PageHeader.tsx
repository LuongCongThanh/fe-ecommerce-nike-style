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
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold">{title}</h1>
      {action}
    </div>
  );
}
