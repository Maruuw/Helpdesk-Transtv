import type { HTMLAttributes } from 'react';

export type MetricDotColor = 'blue' | 'orange' | 'green' | 'purple' | 'cyan' | 'red';

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number | string;
  subtitle: string;
  dotColor?: MetricDotColor;
}
