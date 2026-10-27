import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeStatusType = 'Solved' | 'In progress' | 'Waiting' | 'Return' | 'Pending' | 'Open' | 'Reject' | 'Rejected';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  status: BadgeStatusType;
  showDot?: boolean;
}
