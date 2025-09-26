import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const fabVariants = cva(
  'fixed rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 z-20',
  {
    variants: {
      variant: {
        primary: 'gradient-bg focus:ring-primary-500',
        secondary: 'bg-secondary-500 hover:bg-secondary-600 focus:ring-secondary-500',
        success: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
        warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
        error: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
      },
      size: {
        sm: 'w-12 h-12 text-lg',
        md: 'w-14 h-14 text-xl',
        lg: 'w-16 h-16 text-2xl',
      },
      position: {
        'bottom-right': 'bottom-20 right-6',
        'bottom-left': 'bottom-20 left-6',
        'bottom-center': 'bottom-20 left-1/2 transform -translate-x-1/2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      position: 'bottom-right',
    },
  }
);

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  icon: React.ReactNode;
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, variant, size, position, icon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(fabVariants({ variant, size, position, className }))}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

export { FloatingActionButton, fabVariants };
