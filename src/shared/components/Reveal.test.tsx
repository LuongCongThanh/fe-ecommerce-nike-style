import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Reveal } from '@/shared/components/Reveal';

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useReducedMotion: () => reducedMotion.value };
});

describe('Reveal', () => {
  it('renders its children with the given class', () => {
    reducedMotion.value = false;
    render(
      <Reveal className="reveal-class">
        <p>revealed</p>
      </Reveal>,
    );

    expect(screen.getByText('revealed').parentElement).toHaveClass('reveal-class');
  });

  it('starts fully visible when the user prefers reduced motion', () => {
    reducedMotion.value = true;
    render(
      <Reveal>
        <p>static</p>
      </Reveal>,
    );

    expect(screen.getByText('static').parentElement).toHaveStyle({ opacity: '1' });
  });
});
