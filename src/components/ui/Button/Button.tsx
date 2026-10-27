import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary-form',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    // Variant styles matching Figma specs
    const variantStyles: Record<string, string> = {
      'primary-form': 'bg-[#153F85] hover:bg-[#0f2d60] active:bg-[#0c244d] text-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:ring-[#153F85]',
      'primary-list': 'bg-[#193B70] hover:bg-[#132d56] active:bg-[#0d1e3a] text-white rounded-full focus:ring-[#193B70]',
      'secondary-form': 'bg-white hover:bg-slate-50 text-[#334155] border border-[#CBD5E1] rounded-full focus:ring-slate-400',
      'pill-outline': 'bg-white hover:bg-[#153F85] active:bg-[#0c244d] text-[#334155] hover:text-white border border-[#CBD5E1] hover:border-[#153F85] rounded-full focus:ring-[#153F85] shadow-sm transition-all duration-200',
      'add-file': 'bg-[#DDE9F6] hover:bg-[#cde0f3] text-[#153F85] rounded-full focus:ring-[#153F85]',
      'choose-file': 'bg-[#EFEFEF] hover:bg-[#e2e2e2] text-[#1E293B] border border-[#CBD5E1] rounded-[4px] focus:ring-slate-400 font-medium',
    };

    // Size styles
    const sizeStyles: Record<string, string> = {
      sm: 'text-[11px] leading-[16px] py-[6px] px-[16px]',
      md: 'text-[12px] leading-[16px] py-[10px] px-[28px]',
      lg: 'text-[14px] leading-[20px] py-[12px] px-[28px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant] || variantStyles['primary-form']} ${sizeStyles[size] || sizeStyles['md']} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
