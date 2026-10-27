import { forwardRef } from 'react';
import type { InputProps } from './Input.types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      isRequired = false,
      leftIcon,
      rightIcon,
      className = '',
      readOnly,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const baseInputStyles = 
      'w-full text-[14px] leading-[20px] md:text-[12px] md:leading-[16px] text-[#1E293B] rounded-[8px] transition-all duration-150 ' +
      'placeholder:text-[#94A3B8] placeholder:font-normal ' +
      'focus:outline-none';

    // State styles matching Figma 05 specifications
    const stateStyles = readOnly || disabled
      ? 'bg-[#DDE5ED] border border-[#CBD5E1] cursor-not-allowed text-[#1E293B]'
      : error
      ? 'bg-white border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      : 'bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] shadow-sm';

    // Padding styles (Figma: 12px 16px)
    const paddingStyles = `${leftIcon ? 'pl-[40px]' : 'pl-[16px]'} ${rightIcon ? 'pr-[40px]' : 'pr-[16px]'} py-[12px]`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[12px] leading-[16px] font-bold text-[#1E293B] mb-[8px]"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-[14px] pointer-events-none text-[#64748B] flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            readOnly={readOnly}
            disabled={disabled}
            className={`${baseInputStyles} ${stateStyles} ${paddingStyles} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-[14px] text-[#64748B] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-[6px] text-[11px] leading-[16px] text-red-500 font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="mt-[6px] text-[11px] leading-[16px] text-[#64748B]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
