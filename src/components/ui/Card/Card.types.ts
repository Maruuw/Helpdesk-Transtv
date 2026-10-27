import type { HTMLAttributes, ReactNode } from 'react';

export type CardRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  radius?: CardRadius;
  hasShadow?: boolean;
}
