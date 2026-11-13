'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/utils';

interface CountdownTimerLabels {
  readonly days: string;
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
}

interface CountdownTimerProps {
  readonly targetDate: Date;
  readonly variant?: 'default' | 'compact';
  readonly labels?: CountdownTimerLabels;
}

interface TimeLeft {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

const DEFAULT_LABELS: CountdownTimerLabels = { days: 'Ngày', hours: 'Giờ', minutes: 'Phút', seconds: 'Giây' };

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function CountdownTimer({ targetDate, variant = 'default', labels }: CountdownTimerProps): React.JSX.Element {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = (): void => {
      setTimeLeft(calculateTimeLeft(targetDate));
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [targetDate]);

  if (timeLeft === null) {
    return (
      <div className="flex animate-pulse gap-2">
        {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
          <div key={unit} className="bg-muted size-12 rounded" />
        ))}
      </div>
    );
  }

  const l = { ...DEFAULT_LABELS, ...labels };
  const isCompact = variant === 'compact';

  const units: Array<{ label: string; value: number }> = [
    { label: l.days, value: timeLeft.days },
    { label: l.hours, value: timeLeft.hours },
    { label: l.minutes, value: timeLeft.minutes },
    { label: l.seconds, value: timeLeft.seconds },
  ];

  if (isCompact) {
    return (
      <div className="flex items-center gap-1 text-sm font-medium">
        {units.map((unit, idx) => (
          <span key={unit.label} className="flex items-center gap-1">
            <span className="bg-muted rounded px-1.5 py-0.5 tabular-nums">{pad(unit.value)}</span>
            <span className="text-muted-foreground text-xs">{unit.label}</span>
            {idx < units.length - 1 ? <span className="text-muted-foreground">:</span> : null}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      {units.map((unit, idx) => (
        <div key={unit.label} className="flex items-end gap-2">
          <div className="bg-muted flex flex-col items-center rounded-lg px-4 py-3">
            <span className={cn('leading-none font-bold tabular-nums', 'text-3xl')}>{pad(unit.value)}</span>
            <span className="text-muted-foreground mt-1 text-xs tracking-wide uppercase">{unit.label}</span>
          </div>
          {idx < units.length - 1 ? <span className="text-muted-foreground mb-3 text-2xl font-bold">:</span> : null}
        </div>
      ))}
    </div>
  );
}
