"use client";

import { useCallback, useEffect, useState } from 'react';
import { TrendingUp, Users, FileText, DollarSign } from 'lucide-react';

import { StatCard } from '@molecules';
import { fetchDashboardOverview } from '@services/dashboard-service';
import { calculateSubtotal, calculateTotal, formatNumber, formatPrice } from '@/utils/formatter';
import { Invoice } from '@/types/type';
import { useRouter } from 'next/navigation';

export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    thisMonth: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchDashboardOverview();

      if (result.unauthorized) {
        router.replace('/login');
        return;
      }

      setStats(result.stats);
      setRecentInvoices(result.recentInvoices || []);
      setError(null);
    } catch (err) {
      console.error('خطا در بارگذاری آمار داشبورد:', err);
      setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadStats();

    const interval = setInterval(loadStats, 30000);
    const refreshHandler = () => loadStats();

    window.addEventListener('invoice:saved', refreshHandler);
    window.addEventListener('invoice:deleted', refreshHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('invoice:saved', refreshHandler);
      window.removeEventListener('invoice:deleted', refreshHandler);
    };
  }, [loadStats]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-400">داشبورد</h2>
        {!isLoading && (
          <p className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">
            آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-200 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 sm:mb-4">
          آخرین فاکتورها
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-700 rounded-lg p-3 sm:p-4 animate-pulse"
              >
                <div className="h-3 sm:h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-600 rounded w-1/2"></div>
              </div>
            ))
          ) : recentInvoices.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FileText size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-600 mb-3 sm:mb-4" />
              <p className="text-gray-400 text-base sm:text-lg">
                هنوز فاکتوری یافت نشد
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                اولین فاکتور خود را ایجاد کنید
              </p>
            </div>
          ) : (
            recentInvoices.map((inv: Invoice, index: number) => {
              const subtotal = calculateSubtotal(inv.services);
              const total = calculateTotal(subtotal, inv.discount, inv.tax);

              return (
                <div
                  key={inv._id ?? `${inv.number}-${index}`}
                  className="bg-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-600 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm sm:text-base truncate">{inv.number}</p>
                      <p className="text-gray-300 text-xs sm:text-sm truncate">
                        {inv.customer.name}
                      </p>
                    </div>
                    <div className="md:text-left sm:text-right shrink-0">
                      <p className="text-blue-400 font-bold text-sm sm:text-base">
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