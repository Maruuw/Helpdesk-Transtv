import { forwardRef } from 'react';
import type { MetricCardProps } from './MetricCard.types';

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  ({ label, value, subtitle, dotColor = 'blue', className = '', ...props }, ref) => {
    const dotStyles = {
      blue: 'bg-[#2563EB]',
      orange: 'bg-[#C97D0C]',
      green: 'bg-[#1C9C4C]',
      purple: 'bg-[#7C3AED]',
      cyan: 'bg-[#0284C7]',
      red: 'bg-[#DC2626]',
    }[dotColor] || 'bg-[#2563EB]';

    return (
      <div
        ref={ref}
        className={`bg-white border border-[#E2E8F0]/80 rounded-[18px] p-4 sm:p-5 flex flex-col justify-between shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:shadow-md transition-shadow select-none ${className}`}
        {...props}
      >
        {/* Top: Indicator Dot + Label */}
        <div className="flex items-center gap-[7px] min-w-0">
          <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${dotStyles}`} />
          <span className="text-[12.5px] leading-[18px] font-medium text-[#1E293B] truncate">
            {label}
          </span>
        </div>

        {/* Middle: Big Metric Number */}
        <div className="text-[28px] sm:text-[32px] md:text-[36px] leading-[32px] sm:leading-[38px] font-extrabold text-[#0F172A] my-1 sm:my-1.5 tracking-tight">
          {value}
        </div>

        {/* Bottom: Subtitle / Context */}
        <div className="text-[11px] sm:text-[11.5px] leading-[15px] text-[#64748B] truncate">
          {subtitle}
        </div>
      </div>
    );
  }
);

MetricCard.displayName = 'MetricCard';
