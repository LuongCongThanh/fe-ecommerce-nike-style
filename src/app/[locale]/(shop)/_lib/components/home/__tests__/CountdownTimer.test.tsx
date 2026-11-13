import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CountdownTimer } from '@/app/[locale]/(shop)/_lib/components/home/CountdownTimer';

const BASE_TIME = new Date('2024-01-01T00:00:00.000Z');

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all zero values when target date has passed', () => {
    const past = new Date(BASE_TIME.getTime() - 1000);
    render(<CountdownTimer targetDate={past} />);
    const zeros = screen.getAllByText('00');
    expect(zeros).toHaveLength(4);
  });

  it('renders padded time values for a future date', () => {
    // 1 day + 2 hours + 3 minutes + 4 seconds ahead
    const future = new Date(BASE_TIME.getTime() + 86400_000 + 7200_000 + 180_000 + 4_000);
    render(<CountdownTimer targetDate={future} />);
    expect(screen.getByText('01')).toBeInTheDocument(); // days
    expect(screen.getByText('02')).toBeInTheDocument(); // hours
    expect(screen.getByText('03')).toBeInTheDocument(); // minutes
    expect(screen.getByText('04')).toBeInTheDocument(); // seconds
  });

  it('renders default labels', () => {
    const future = new Date(BASE_TIME.getTime() + 86400_000);
    render(<CountdownTimer targetDate={future} />);
    expect(screen.getByText('Ngày')).toBeInTheDocument();
    expect(screen.getByText('Giờ')).toBeInTheDocument();
    expect(screen.getByText('Phút')).toBeInTheDocument();
    expect(screen.getByText('Giây')).toBeInTheDocument();
  });

  it('renders custom labels', () => {
    const future = new Date(BASE_TIME.getTime() + 86400_000);
    render(<CountdownTimer targetDate={future} labels={{ days: 'Days', hours: 'Hours', minutes: 'Mins', seconds: 'Secs' }} />);
    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Mins')).toBeInTheDocument();
    expect(screen.getByText('Secs')).toBeInTheDocument();
  });

  it('updates the seconds value each tick', () => {
    const future = new Date(BASE_TIME.getTime() + 10_000); // 10 seconds
    render(<CountdownTimer targetDate={future} />);
    expect(screen.getByText('10')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('09')).toBeInTheDocument();
  });

  it('shows all zeros after target date elapses', () => {
    const future = new Date(BASE_TIME.getTime() + 1_000); // 1 second
    render(<CountdownTimer targetDate={future} />);
    expect(screen.getByText('01')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getAllByText('00')).toHaveLength(4);
  });
});

describe('CountdownTimer — compact variant', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders separator colons between units', () => {
    const future = new Date(BASE_TIME.getTime() + 86400_000);
    render(<CountdownTimer targetDate={future} variant="compact" />);
    const colons = screen.getAllByText(':');
    expect(colons).toHaveLength(3);
  });

  it('renders compact labels alongside values', () => {
    const future = new Date(BASE_TIME.getTime() + 86400_000);
    render(<CountdownTimer targetDate={future} variant="compact" />);
    expect(screen.getByText('Ngày')).toBeInTheDocument();
    expect(screen.getByText('Giây')).toBeInTheDocument();
  });
});
