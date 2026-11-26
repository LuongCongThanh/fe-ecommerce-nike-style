import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionHeading } from '@/shared/components/SectionHeading';

describe('SectionHeading', () => {
  it('renders only the title by default', () => {
    render(<SectionHeading title="New arrivals" />);

    expect(screen.getByRole('heading', { level: 2, name: 'New arrivals' })).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders subtitle and a link when both CTA label and href are given', () => {
    render(<SectionHeading title="Sale" subtitle="Up to 50% off" ctaLabel="View all" ctaHref="/sale" />);

    expect(screen.getByText('Up to 50% off')).toBeVisible();
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute('href', '/sale');
  });

  it('omits the link when the href is empty', () => {
    render(<SectionHeading title="Sale" ctaLabel="View all" ctaHref="" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('centres its content when align is center', () => {
    render(<SectionHeading title="Centered" align="center" ctaLabel="Go" ctaHref="/go" />);

    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/go');
    expect(screen.getByRole('heading').closest('.text-center')).not.toBeNull();
  });
});
