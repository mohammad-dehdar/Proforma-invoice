import React from 'react';
import { cn } from '@utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  isRTL?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, isRTL = true, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'w-full bg-gray-700 text-white rounded px-4 py-2 border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500',
            isRTL && 'text-right',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-400 text-right">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';