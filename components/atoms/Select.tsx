import React from 'react';
import { cn } from '@/lib/utils';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select: React.FC<SelectProps> = ({ className, ...props }) => {
    return (
        <select
            className={cn(
                'w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none',
                className
            )}
            {...props}
        />
    );
};
