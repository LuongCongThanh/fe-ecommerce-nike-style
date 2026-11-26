import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FacebookMark, GoogleMark, TwitterMark } from '@/shared/components/SocialMarks';

describe('SocialMarks', () => {
  it.each([
    ['FacebookMark', FacebookMark],
    ['TwitterMark', TwitterMark],
    ['GoogleMark', GoogleMark],
  ])('%s renders a decorative svg hidden from assistive technology', (_name, Mark) => {
    const { container } = render(<Mark />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.querySelector('path')).not.toBeNull();
  });
});
