'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, FileText, DollarSign, LucideIcon } from 'lucide-react';
import { formatPrice, formatNumber } from '@/utils/formatter';
import { Invoice, Service } from '@/types/type';

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: string;
    color: string;
}

const StatCard = ({ icon: Icon, title, value, color }: StatCardProps) => (
    <div className="bg-gray-800 rounded-lg p-6 border-r-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm mb-1">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
            <div className="p-3 rounded-full bg-gray-700">
                <Icon style={{ color }} size={24} />
            </div>
        </div>
    </div>
);

export const Dashboard = () => {
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        thisMonth: 0,
    });

    useEffect(() => {
        const loadStats = () => {
            try {
                const history: Invoice[] = JSON.parse(localStorage.getItem('invoice-history') || '[]');
                const total = history.reduce((sum: number, inv: Invoice) => {
                    const invTotal = inv.services.reduce((s: number, service: Service) =>
                        s + service.price * service.quantity, 0
                    );
                    const discount = invTotal * ((inv.discount || 0) / 100);
                    const afterDiscount = invTotal - discount;
                    const tax = afterDiscount * ((inv.tax || 0) / 100);
                    return sum + afterDiscount + tax;
                }, 0);

                const now = new Date();
                const thisMonthCount = history.filter((inv: Invoice) => {
                    const parts = inv.date.split('/');
                    if (parts.length === 3) {
                        const invMonth = parseInt(parts[1]);
                        return invMonth === (now.getMonth() + 1);
                    }
                    return false;
                }).length;

                setStats({
                    totalInvoices: history.length,
                    totalRevenue: total,
                    totalCustomers: new Set(history.map((inv: Invoice) => inv.customer.name)).size,
                    thisMonth: thisMonthCount,
                });
            } catch (error) {
                console.error('Error loading dashboard stats:', error);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">داشبورد</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    title="کل فاکتورها"
                    value={formatNumber(stats.totalInvoices)}
                    color="#3b82f6"
                />
                <StatCard
                    icon={DollarSign}
                    title="کل درآمد"
                    value={`${formatPrice(stats.totalRevenue)} ت`}
                    color="#10b981"
                />
                <StatCard
                    icon={Users}
                    title="تعداد مشتریان"
                    value={formatNumber(stats.totalCustomers)}
                    color="#f59e0b"
                />
                <StatCard
                    icon={TrendingUp}
                    title="فاکتورهای ماه جاری"
                    value={formatNumber(stats.thisMonth)}
                    color="#8b5cf6"
                />
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4">آخرین فاکتورها</h3>
                <div className="space-y-3">
                    {(() => {
                        let history: Invoice[] = [];
                        try {
                            history = JSON.parse(localStorage.getItem('invoice-history') || '[]');
                        } catch {
                            return <p className="text-gray-400 text-center">خطا در خواندن تاریخچه</p>;
                        }

                        const recentInvoices = history.slice(-5).reverse();

                        if (recentInvoices.length === 0) {
                            return <p className="text-gray-400 text-center">هیچ فاکتوری یافت نشد</p>;
                        }

                        return recentInvoices.map((inv: Invoice) => {
                            const subtotal = inv.services.reduce((s: number, service: Service) => {
                                return s + service.price * service.quantity;
                            }, 0);
                            const discount = subtotal * ((inv.discount || 0) / 100);
                            const afterDiscount = subtotal - discount;
                            const tax = afterDiscount * ((inv.tax || 0) / 100);
                            const total = afterDiscount + tax;

                            return (
                                <div key={inv.number} className="bg-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-bold">{inv.number}</p>
                                            <p className="text-gray-300 text-sm">{inv.customer.name}</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-blue-400 font-bold">{formatPrice(total)} تومان</p>
                                            <p className="text-gray-400 text-xs">{inv.date}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>
        </div>
    );
};