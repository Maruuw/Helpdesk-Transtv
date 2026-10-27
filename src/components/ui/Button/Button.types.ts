import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 
  | 'primary-form'     // #153F85 - Send ticket
  | 'primary-list'     // #193B70 - Create New Ticket
  | 'secondary-form'   // Outline white / border #CBD5E1 - Cancel
  | 'pill-outline'     // Outline pill for Sign In (#334155 / border #CBD5E1)
  | 'add-file'         // #DDE9F6 / #153F85
  | 'choose-file';     // #EFEFEF / #1E293B

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
