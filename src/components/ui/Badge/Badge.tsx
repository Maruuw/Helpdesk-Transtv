import { forwardRef } from 'react';
import type { BadgeProps } from './Badge.types';

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ status, children, showDot = true, className = '', ...props }, ref) => {
    const config = {
      'Solved': {
        bg: 'bg-[#E7F7ED]',
        text: 'text-[#1C9C4C]',
        dot: 'bg-[#1C9C4C]',
      },
      'In progress': {
        bg: 'bg-[#E7F0FD]',
        text: 'text-[#2563EB]',
        dot: 'bg-[#2563EB]',
      },
      'Waiting': {
        bg: 'bg-[#FEF5E7]',
        text: 'text-[#C97D0C]',
        dot: 'bg-[#C97D0C]',
      },
      'Return': {
        bg: 'bg-[#FEF5E7]',
        text: 'text-[#C97D0C]',
        dot: 'bg-[#C97D0C]',
      },
      'Pending': {
        bg: 'bg-[#FFFBEB]',
        text: 'text-[#B45309]',
        dot: 'bg-[#F59E0B]',
      },
      'Open': {
        bg: 'bg-[#F1F5F9]',
        text: 'text-[#475569]',
        dot: 'bg-[#64748B]',
      },
      'Reject': {
        bg: 'bg-[#FEE2E2]',
        text: 'text-[#DC2626]',
        dot: 'bg-[#DC2626]',
      },
      'Rejected': {
        bg: 'bg-[#FEE2E2]',
        text: 'text-[#DC2626]',
        dot: 'bg-[#DC2626]',
      },
    }[status] || {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      dot: 'bg-slate-500',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-[6px] px-[12px] py-[3px] rounded-full text-[12px] leading-[16px] font-semibold select-none ${config.bg} ${config.text} ${className}`}
        {...props}
      >
        {showDot && (
          <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${config.dot}`} />
        )}
        <span>{children || status}</span>
      </span>
    );
  }
);

Badge.displayName = 'Badge';
