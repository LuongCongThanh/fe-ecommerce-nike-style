'use client';

import * as React from 'react';

import * as RechartsPrimitive from 'recharts';

import { cn } from '../lib/cn';

/**
 * shadcn/ui-style Chart wrapper around Recharts (design review on the admin redesign: "shadcn/ui
 * Charts" over ApexCharts — stays inside the same Radix/cva component ecosystem the rest of
 * `@repo/ui` uses, instead of an imperative charting library). `ChartConfig` maps a data series key
 * to a label + colour; colours are CSS custom properties per series (`--color-<key>`) so a chart
 * re-themes for free alongside the rest of the design tokens, light or dark.
 */
export type ChartConfig = Record<
  string,
  | {
      readonly label: React.ReactNode;
      readonly color?: string;
      readonly icon?: React.ComponentType;
    }
  | undefined
>;

interface ChartContextValue {
  readonly config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart(): ChartContextValue {
  const context = React.useContext(ChartContext);
  if (context === null) {
    throw new Error('Chart components must be used within a <ChartContainer>');
  }
  return context;
}

interface ChartContainerProps extends React.ComponentProps<'div'> {
  readonly config: ChartConfig;
  readonly children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
}

function ChartContainer({ config, className, children, ...props }: ChartContainerProps): React.JSX.Element {
  const colorStyle = Object.fromEntries(
    Object.entries(config)
      .filter(([, value]) => value?.color !== undefined)
      .map(([key, value]) => [`--color-${key}`, value?.color]),
  ) as React.CSSProperties;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        style={colorStyle}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

interface ChartTooltipContentProps extends React.ComponentProps<'div'> {
  readonly active?: boolean;
  readonly payload?: readonly { readonly name?: string; readonly value?: number | string; readonly color?: string; readonly dataKey?: string }[];
  readonly label?: React.ReactNode;
  readonly hideLabel?: boolean;
  readonly labelFormatter?: (label: React.ReactNode) => React.ReactNode;
}

function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  labelFormatter,
  className,
}: ChartTooltipContentProps): React.JSX.Element | null {
  const { config } = useChart();

  if (active !== true || payload === undefined || payload.length === 0) return null;

  return (
    <div className={cn('border-border/50 bg-background grid min-w-[8rem] gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl', className)}>
      {hideLabel ? null : <p className="text-foreground font-medium">{labelFormatter ? labelFormatter(label) : label}</p>}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = item.dataKey ?? item.name ?? String(index);
          const itemConfig = config[key];
          return (
            <div key={key} className="flex w-full items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
              </div>
              <span className="text-foreground font-mono font-medium tabular-nums">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendContentProps extends React.ComponentProps<'div'> {
  readonly payload?: readonly { readonly value?: string; readonly color?: string; readonly dataKey?: string }[];
}

function ChartLegendContent({ payload, className }: ChartLegendContentProps): React.JSX.Element | null {
  const { config } = useChart();

  if (payload === undefined || payload.length === 0) return null;

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {payload.map((item) => {
        const key = item.dataKey ?? item.value ?? '';
        const itemConfig = config[key];
        return (
          <div key={key} className="flex items-center gap-1.5">
            <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{itemConfig?.label ?? item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent };
export const RechartsPrimitives = RechartsPrimitive;
