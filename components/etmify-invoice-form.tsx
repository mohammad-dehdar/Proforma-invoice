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
} from '@/features';
import { FileText, Home, History } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useInvoiceStore } from '@/store/use-invoice-store';
import { View } from '@/types/type';
import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export default function InvoicePage() {
  const [currentView, setCurrentView] = useState<View>('invoice');
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { invoice } = useInvoiceStore();
  const router = useRouter();
  const { user, logout, checkSession, initialized, loading } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      logout: state.logout,
      checkSession: state.checkSession,
      initialized: state.initialized,
      loading: state.loading,
    }))
  );

  useEffect(() => {
    if (!initialized) {
      checkSession();
    }
  }, [initialized, checkSession]);

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.replace('/login');
    }
  }, [initialized, loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handlePrint = () => {
    window.print();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        {!showPreview && (
          <div className="bg-gray-800 rounded-lg shadow-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400 text-center sm:text-right w-full sm:w-auto">
                ETMIFY - سیستم پیش‌فاکتور
              </h1>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-end w-full sm:w-auto">
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
                {user && (
                  <Button
                    variant="outline"
                    color="red"
                    onClick={handleLogout}
                    className="text-xs sm:text-sm md:text-base"
                  >
                    خروج ({user.username})
                  </Button>
                )}
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