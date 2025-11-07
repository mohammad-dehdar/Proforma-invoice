"use client";

import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    disableClose?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    disableClose,
    size = 'md',
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disableClose) return;
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div className={`bg-gray-800 rounded-lg p-6 w-full ${sizeClasses[size]} mx-4 shadow-2xl`}>
                <div className="flex justify-between items-center mb-4">
                    {title ? (
                        <h3 className="text-xl font-bold text-blue-400">{title}</h3>
                    ) : (
                        <span />
                    )}
                    <button
                        onClick={onClose}
                        disabled={!!disableClose}
                        className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        aria-label="بستن"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="text-gray-200">{children}</div>

                {footer && (
                    <div className="mt-6 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
