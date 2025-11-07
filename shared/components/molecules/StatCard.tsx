import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: string;
    color: string;
    isLoading?: boolean;
}

export const StatCard = ({
    icon: Icon,
    title,
    value,
    color,
    isLoading,
}: StatCardProps) => (
    <div
        className="bg-gray-800 rounded-lg p-4 sm:p-6 border-r-4 transition-transform hover:scale-105"
        style={{ borderColor: color }}
    >
        <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">{title}</p>
                {isLoading ? (
                    <div className="h-6 sm:h-8 bg-gray-700 animate-pulse rounded"></div>
                ) : (
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">{value}</p>
                )}
            </div>
            <div className="p-2 sm:p-3 rounded-full bg-gray-700 shrink-0">
                <Icon style={{ color }} size={20} className="sm:w-6 sm:h-6" />
            </div>
        </div>
    </div>
);
