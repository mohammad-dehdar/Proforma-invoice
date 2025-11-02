// src/components/atoms/Button.tsx
import { cn } from '@/lib/utils';
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger';
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, ...props }) => {
    const base = 'rounded px-4 py-2 font-medium transition-all flex items-center gap-2';
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
    };
    return <button className={cn(base, variants[variant], className)} {...props} />;
};
