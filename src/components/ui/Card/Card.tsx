import { forwardRef } from 'react';
import type { CardProps } from './Card.types';

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, radius = 'lg', hasShadow = false, className = '', ...props }, ref) => {
    const radiusStyles = {
      sm: 'rounded-[8px]',
      md: 'rounded-[12px]',
      lg: 'rounded-[16px]',     // 16px - metric & form cards
      xl: 'rounded-[20px]',
      '2xl': 'rounded-[24px]',   // 24px - list & detail cards
      '3xl': 'rounded-[32px]',   // 32px - dashboard & page container
    }[radius];

    const shadowStyles = hasShadow 
      ? 'shadow-[0_4px_20px_rgba(15,23,42,0.06)]' 
      : 'shadow-none';

    return (
      <div
        ref={ref}
        className={`bg-white border border-[#E2E8F0]/70 ${radiusStyles} ${shadowStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
