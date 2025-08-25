import React from 'react';
import { cva } from 'class-variance-authority';

// Simple utility function to combine class names
const cn = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] hover:shadow-lg hover:transform hover:scale-[1.02] hover:-translate-y-0.5 focus-visible:ring-[var(--color-primary-500)]',
        secondary: 'bg-[var(--color-gray-100)] text-[var(--color-gray-800)] hover:bg-[var(--color-gray-200)] hover:shadow-md focus-visible:ring-[var(--color-gray-400)]',
        outline: 'border border-[var(--color-gray-300)] bg-transparent hover:bg-[var(--color-gray-50)] text-[var(--color-gray-800)] focus-visible:ring-[var(--color-gray-400)]',
        ghost: 'bg-transparent text-[var(--color-gray-800)] hover:bg-[var(--color-gray-100)] focus-visible:ring-[var(--color-gray-400)]',
        link: 'bg-transparent text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] hover:underline p-0 h-auto focus-visible:ring-[var(--color-primary-500)]',
        danger: 'bg-[var(--color-error)] text-white hover:bg-[#b71c1c] hover:shadow-lg focus-visible:ring-[var(--color-error)]',
        success: 'bg-[var(--color-success)] text-white hover:bg-[#1b5e20] hover:shadow-lg focus-visible:ring-[var(--color-success)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs min-h-[32px]',
        md: 'h-10 px-4 py-2 text-sm min-h-[40px]',
        lg: 'h-12 px-6 py-3 text-base min-h-[44px]',
        xl: 'h-14 px-8 py-4 text-lg min-h-[56px]',
      },
      fullWidth: {
        true: 'w-full',
      },
      responsive: {
        true: 'text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      responsive: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  responsive?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, responsive, isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, responsive, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <div className="mr-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          </div>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };