// shared/components/atoms/Button.tsx
import { cn } from '@utils/cn';
import React from 'react';

type ButtonVariant = 'filled' | 'outline' | 'ghost' | 'primary' | 'secondary' | 'danger';
type ButtonColor = 'blue' | 'green' | 'purple' | 'red' | 'gray';
type ButtonSize = 'sm' | 'md';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
};

const colorPalette: Record<ButtonColor, { filled: string; outline: string; ghost: string }> = {
    blue: {
        filled: 'bg-blue-600 hover:bg-blue-700 text-white',
        outline: 'border border-blue-500 text-blue-400 hover:bg-blue-500/10',
        ghost: 'text-blue-400 hover:bg-blue-500/10',
    },
    green: {
        filled: 'bg-green-600 hover:bg-green-700 text-white',
        outline: 'border border-green-500 text-green-400 hover:bg-green-500/10',
        ghost: 'text-green-400 hover:bg-green-500/10',
    },
    purple: {
        filled: 'bg-purple-600 hover:bg-purple-700 text-white',
        outline: 'border border-purple-500 text-purple-400 hover:bg-purple-500/10',
        ghost: 'text-purple-400 hover:bg-purple-500/10',
    },
    red: {
        filled: 'bg-red-600 hover:bg-red-700 text-white',
        outline: 'border border-red-500 text-red-400 hover:bg-red-500/10',
        ghost: 'text-red-400 hover:bg-red-500/10',
    },
    gray: {
        filled: 'bg-gray-600 hover:bg-gray-700 text-white',
        outline: 'border border-gray-500 text-gray-300 hover:bg-gray-500/10',
        ghost: 'text-gray-300 hover:bg-gray-500/10',
    },
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'filled',
    color = 'blue',
    size = 'md',
    className,
    ...props
}) => {
    // Backward compatibility mapping
    let resolvedVariant: 'filled' | 'outline' | 'ghost' = 'filled';
    let resolvedColor: ButtonColor = color;

    if (variant === 'primary') {
        resolvedVariant = 'filled';
        resolvedColor = color || 'blue';
    } else if (variant === 'secondary') {
        resolvedVariant = 'filled';
        resolvedColor = color || 'gray';
    } else if (variant === 'danger') {
        resolvedVariant = 'filled';
        resolvedColor = color || 'red';
    } else if (variant === 'filled' || variant === 'outline' || variant === 'ghost') {
        resolvedVariant = variant;
    }

    const baseBySize: Record<ButtonSize, string> = {
        md: 'rounded-lg px-4 py-2.5 sm:px-6 sm:py-3',
        sm: 'rounded p-1.5',
    };
    const base = cn(
        baseBySize[size],
        'font-medium transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
    );
    const variantClasses = colorPalette[resolvedColor][resolvedVariant];

    return <button className={cn(base, variantClasses, className)} {...props} />;
};
