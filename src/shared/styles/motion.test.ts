import { describe, expect, it } from 'vitest';

import { projectMomentum, rubberband } from '@/shared/styles/motion';

describe('projectMomentum', () => {
  it('projects a 100 px/s flick 49.9 px at the default deceleration rate', () => {
    expect(projectMomentum(100)).toBeCloseTo(49.9);
  });

  it('preserves the direction of a flick', () => {
    expect(projectMomentum(-100)).toBeCloseTo(-49.9);
  });
});

describe('rubberband', () => {
  it('resists a positive overshoot by a bounded amount', () => {
    expect(rubberband(10, 100)).toBeCloseTo(5.213270142180095);
  });

  it('preserves the direction of a negative overshoot', () => {
    expect(rubberband(-10, 100)).toBeCloseTo(-5.213270142180095);
  });
});
