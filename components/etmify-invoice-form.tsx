'use client';

import { useState } from 'react';
import {
  InvoiceActions,
  InvoiceForm,
  InvoicePreview,
  ServiceList,
  Dashboard,
  DiscountTax,
  EmailModal,
  InvoiceHistory,
} from './templates';
import { FileText, Home, History } from 'lucide-react';
import { useInvoiceStore } from '@/store/use-invoice-store';
import { View } from '@/types/type';

export default function InvoicePage() {
  const [currentView, setCurrentView] = useState<View>('invoice');
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { invoice } = useInvoiceStore();

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        {!showPreview && (
          <div className="bg-gray-800 rounded-lg shadow-2xl p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h1 className="text-2xl font-bold text-blue-400">
                ETMIFY - سیستم پیش‌فاکتور
              </h1>
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={() => setCurrentView('invoice')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    currentView === 'invoice'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  type="button"
                >
                  <FileText size={18} />
                  فاکتور جدید
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  type="button"
                >
                  <Home size={18} />
                  داشبورد
                </button>
                <button
                  onClick={() => setCurrentView('history')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    currentView === 'history'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  type="button"
                >
                  <History size={18} />
                  تاریخچه
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