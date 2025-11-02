'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  LucideIcon,
} from 'lucide-react';
import { formatPrice, formatNumber, calculateTotal } from '@/utils/formatter';
import { Invoice, Service } from '@/types/type';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  color: string;
  isLoading?: boolean;
}

const StatCard = ({
  icon: Icon,
  title,
  value,
  color,
  isLoading,
}: StatCardProps) => (
  <div
    className="bg-gray-800 rounded-lg p-6 border-r-4 transition-transform hover:scale-105"
    style={{ borderColor: color }}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        {isLoading ? (
          <div className="h-8 bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <p className="text-2xl font-bold text-white">{value}</p>
        )}
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
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = () => {
      setIsLoading(true);

      try {
        // بررسی دسترسی به localStorage
        if (typeof window === 'undefined') {
          return;
        }

        const history: Invoice[] = JSON.parse(
          localStorage.getItem('invoice-history') || '[]'
        );

        // محاسبه کل درآمد
        const total = history.reduce((sum: number, inv: Invoice) => {
          const subtotal = inv.services.reduce(
            (s: number, service: Service) =>
              s + service.price * service.quantity,
            0
          );
          return sum + calculateTotal(subtotal, inv.discount, inv.tax);
        }, 0);

        // محاسبه فاکتورهای ماه جاری
        const now = new Date();
        const thisMonthCount = history.filter((inv: Invoice) => {
          const parts = inv.date.split('/');
          if (parts.length === 3) {
            const invMonth = parseInt(parts[1]);
            return invMonth === now.getMonth() + 1;
          }
          return false;
        }).length;

        // تعداد مشتریان منحصر به فرد
        const uniqueCustomers = new Set(
          history.map((inv: Invoice) => inv.customer.name)
        ).size;

        setStats({
          totalInvoices: history.length,
          totalRevenue: total,
          totalCustomers: uniqueCustomers,
          thisMonth: thisMonthCount,
        });

        // آخرین فاکتورها
        setRecentInvoices(history.slice(-5).reverse());
      } catch (error) {
        console.error('خطا در بارگذاری آمار داشبورد:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();

    // بروزرسانی هر 30 ثانیه
    const interval = setInterval(loadStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-400">داشبورد</h2>
        {!isLoading && (
          <p className="text-gray-400 text-sm">
            آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="کل فاکتورها"
          value={formatNumber(stats.totalInvoices)}
          color="#3b82f6"
          isLoading={isLoading}
        />
        <StatCard
          icon={DollarSign}
          title="کل درآمد"
          value={`${formatPrice(stats.totalRevenue)} ت`}
          color="#10b981"
          isLoading={isLoading}
        />
        <StatCard
          icon={Users}
          title="تعداد مشتریان"
          value={formatNumber(stats.totalCustomers)}
          color="#f59e0b"
          isLoading={isLoading}
        />
        <StatCard
          icon={TrendingUp}
          title="فاکتورهای ماه جاری"
          value={formatNumber(stats.thisMonth)}
          color="#8b5cf6"
          isLoading={isLoading}
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-400 mb-4">
          آخرین فاکتورها
        </h3>
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-700 rounded-lg p-4 animate-pulse"
              >
                <div className="h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </div>
            ))
          ) : recentInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">
                هنوز فاکتوری یافت نشد
              </p>
              <p className="text-gray-500 text-sm mt-2">
                اولین فاکتور خود را ایجاد کنید
              </p>
            </div>
          ) : (
            recentInvoices.map((inv: Invoice) => {
              const subtotal = inv.services.reduce(
                (s: number, service: Service) =>
                  s + service.price * service.quantity,
                0
              );
              const total = calculateTotal(subtotal, inv.discount, inv.tax);

              return (
                <div
                  key={inv.number}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">{inv.number}</p>
                      <p className="text-gray-300 text-sm">
                        {inv.customer.name}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-blue-400 font-bold">
                        {formatPrice(total)} تومان
                      </p>
                      <p className="text-gray-400 text-xs">{inv.date}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};