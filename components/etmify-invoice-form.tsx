'use client';

import { useEffect, useState } from 'react';
import {
  InvoiceActions,
  InvoiceForm,
  InvoicePreview,
  ServiceList,
  Dashboard,
  DiscountTax,
  EmailModal,
  InvoiceHistory,
  LoginForm,
} from '@/features';
import { FileText, Home, History } from 'lucide-react';
import { useInvoiceStore } from '@/store/use-invoice-store';
import { View } from '@/types/type';
import { useAuthStore } from '@/store/use-auth-store';

export default function InvoicePage() {
  const [currentView, setCurrentView] = useState<View>('invoice');
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { invoice } = useInvoiceStore();
  const { user, setUser, isChecking, setIsChecking, setError } = useAuthStore((state) => ({
    user: state.user,
    setUser: state.setUser,
    isChecking: state.isChecking,
    setIsChecking: state.setIsChecking,
    setError: state.setError,
  }));
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      setIsChecking(true);
      setError(null);
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('خطا در بررسی جلسه کاربر', error);
        setUser(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [setError, setIsChecking, setUser]);

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('خطا در خروج از حساب کاربری', error);
    } finally {
      setUser(null);
      setIsLoggingOut(false);
    }
  };

  const renderView = () => {
    if (showPreview) {
      return (
        <InvoicePreview
          setShowPreview={setShowPreview}
          handlePrint={handlePrint}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;

      case 'history':
        return (
          <InvoiceHistory onNavigateToInvoice={() => setCurrentView('invoice')} />
        );

      case 'invoice':
      default:
        return (
          <>
            <InvoiceForm />
            <DiscountTax />
            <ServiceList />
            <InvoiceActions
              onPreview={() => setShowPreview(true)}
              onEmail={() => setShowEmailModal(true)}
            />
          </>
        );
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300 text-sm sm:text-base">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        {!showPreview && (
          <div className="bg-gray-800 rounded-lg shadow-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400 text-center sm:text-right w-full sm:w-auto">
                  ETMIFY - سیستم پیش‌فاکتور
                </h1>
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-400">ورود با نام کاربری</p>
                    <p className="text-sm sm:text-base text-white font-semibold truncate max-w-[160px]">
                      {user.username}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-400/40 text-xs sm:text-sm hover:bg-red-500/20 transition-colors"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? 'در حال خروج...' : 'خروج'}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-end">
                <button
                  onClick={() => setCurrentView('invoice')}
                  className={`text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-all flex-1 sm:flex-none min-w-[100px] sm:min-w-0 ${currentView === 'invoice'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  type="button"
                >
                  <FileText size={14} className="sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">فاکتور جدید</span>
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-all flex-1 sm:flex-none min-w-[100px] sm:min-w-0 ${currentView === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  type="button"
                >
                  <Home size={14} className="sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">داشبورد</span>
                </button>
                <button
                  onClick={() => setCurrentView('history')}
                  className={`text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-all flex-1 sm:flex-none min-w-[100px] sm:min-w-0 ${currentView === 'history'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  type="button"
                >
                  <History size={14} className="sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">تاریخچه</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {renderView()}

        {/* Email Modal */}
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          invoiceNumber={invoice.number}
        />
      </div>
    </div>
  );
}