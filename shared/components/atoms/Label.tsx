import React from 'react';
import { cn } from '@utils/cn';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  isRTL?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, isRTL = true, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-gray-300 mb-2 font-medium',
          isRTL && 'text-right',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';