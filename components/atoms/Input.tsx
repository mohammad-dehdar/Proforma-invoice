import React from 'react';
import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
    return (
        <input
            className={cn(
                'w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none',
                className
            )}
            {...props}
        />
    );
};
