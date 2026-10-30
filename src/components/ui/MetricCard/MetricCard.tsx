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
        className={`bg-white border border-[#E2E8F0]/70 rounded-[16px] p-[24px] min-h-[140px] flex flex-col justify-between shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:shadow-md transition-shadow select-none ${className}`}
        {...props}
      >
        {/* Top: Indicator Dot + Label */}
        <div className="flex items-center gap-[8px]">
          <span className={`w-[8px] h-[8px] rounded-full flex-shrink-0 ${dotStyles}`} />
          <span className="text-[13px] leading-[18px] font-medium text-[#1E293B]">
            {label}
          </span>
        </div>

        {/* Middle: Big Metric Number (36/40 ExtraBold) */}
        <div className="text-[36px] leading-[40px] font-extrabold text-[#0F172A] my-2">
          {value}
        </div>

        {/* Bottom: Subtitle / Context */}
        <div className="text-[12px] leading-[16px] text-[#64748B]">
          {subtitle}
        </div>
      </div>
    );
  }
);

MetricCard.displayName = 'MetricCard';
