import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageShell } from '@/shared/components/PageShell';

describe('PageShell', () => {
  it.each([
    ['Form', PageShell.Form, 'max-w-lg'],
    ['List', PageShell.List, 'max-w-3xl'],
    ['Browse', PageShell.Browse, 'max-w-7xl'],
  ])('%s wraps children in a container with its width', (_name, Shell, widthClass) => {
    render(
      <Shell className="extra">
        <p>content</p>
      </Shell>,
    );

    expect(screen.getByText('content').parentElement).toHaveClass(widthClass, 'extra', 'mx-auto');
  });

  it('Split renders the main content and the sidebar', () => {
    render(
      <PageShell.Split sidebar={<aside>sidebar</aside>} className="split-extra">
        <p>main</p>
      </PageShell.Split>,
    );

    expect(screen.getByText('main')).toBeVisible();
    expect(screen.getByText('sidebar')).toBeVisible();
    expect(screen.getByText('main').closest('.split-extra')).not.toBeNull();
  });
});
