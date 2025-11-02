import React from 'react';
import { cn } from '@/lib/utils';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label: React.FC<LabelProps> = ({ className, ...props }) => {
    return (
        <label
            className={cn(
                'block text-gray-300 mb-2 text-right font-medium',
                className
            )}
            {...props}
        />
    );
};
