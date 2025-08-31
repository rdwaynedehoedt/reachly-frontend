import React from 'react';

// Simple utility function to combine class names
const cn = (...classes: (string | undefined | boolean | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  responsive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leftIcon, rightIcon, fullWidth = false, responsive = false, size = 'md', ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Size-based styling
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-3 py-2 text-sm min-h-[40px]',
      lg: 'px-4 py-3 text-base min-h-[44px]'
    };
    
    // Responsive classes
    const responsiveClasses = responsive 
      ? 'text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 min-h-[44px]' 
      : sizeClasses[size];
    
    return (
      <div className={cn('mb-4', fullWidth ? 'w-full' : '')}>
        {label && (
          <label htmlFor={inputId} className={cn(
            'form-label block mb-1 text-sm font-medium text-gray-700',
            responsive ? 'text-sm sm:text-base' : ''
          )}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-gray-500)]',
              'min-h-[44px] flex items-center justify-center touch-target'
            )}>
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'form-input w-full bg-white border border-[var(--color-gray-300)] rounded-md transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent',
              'touch-target',
              responsiveClasses,
              leftIcon ? (responsive ? 'pl-10 sm:pl-12' : 'pl-10') : '',
              rightIcon ? (responsive ? 'pr-10 sm:pr-12' : 'pr-10') : '',
              error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-gray-500)]',
              'min-h-[44px] min-w-[44px] flex items-center justify-center touch-target'
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && !error && (
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">{helperText}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };