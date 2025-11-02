'use client';

import { Eye, Save, Mail } from 'lucide-react';
import { useInvoiceStore } from '@/store/use-invoice-store';
import { validateInvoice } from '@/utils/validation';
import { useState } from 'react';

interface InvoiceActionsProps {
  onPreview: () => void;
  onEmail?: () => void;
}

export const InvoiceActions = ({ onPreview, onEmail }: InvoiceActionsProps) => {
  const { invoice } = useInvoiceStore();
  const [isSaving, setIsSaving] = useState(false);

  const validation = validateInvoice(invoice);

  const handleSave = async () => {
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join('\n');
      alert(`لطفاً خطاهای زیر را برطرف کنید:\n\n${errorMessages}`);
      return;
    }

    setIsSaving(true);

    try {
      // بررسی دسترسی به localStorage
      if (typeof window === 'undefined') {
        throw new Error('localStorage در دسترس نیست');
      }

      const history = JSON.parse(
        localStorage.getItem('invoice-history') || '[]'
      );

      // بررسی تکراری نبودن شماره فاکتور
      const existingIndex = history.findIndex(
        (inv: typeof invoice) => inv.number === invoice.number
      );

      if (existingIndex !== -1) {
        const shouldReplace = confirm(
          'فاکتور با این شماره قبلاً ذخیره شده است. آیا می‌خواهید آن را جایگزین کنید؟'
        );

        if (!shouldReplace) {
          setIsSaving(false);
          return;
        }

        // جایگزینی فاکتور قدیمی
        history[existingIndex] = {
          ...invoice,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // اضافه کردن فاکتور جدید
        history.push({
          ...invoice,
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.setItem('invoice-history', JSON.stringify(history));
      
      // نمایش پیام موفقیت
      alert('✅ فاکتور با موفقیت ذخیره شد!');
    } catch (error) {
      console.error('خطا در ذخیره فاکتور:', error);
      alert('❌ خطا در ذخیره فاکتور! لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join('\n');
      alert(`لطفاً خطاهای زیر را برطرف کنید:\n\n${errorMessages}`);
      return;
    }
    onPreview();
  };

  const handleEmail = () => {
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join('\n');
      alert(`لطفاً خطاهای زیر را برطرف کنید:\n\n${errorMessages}`);
      return;
    }
    if (onEmail) onEmail();
  };

  return (
    <>
      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={handleSave}
          disabled={!validation.isValid || isSaving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center gap-2 text-lg transition-colors shadow-lg hover:shadow-xl"
          title="ذخیره فاکتور در تاریخچه"
          type="button"
        >
          <Save size={20} />
          {isSaving ? 'در حال ذخیره...' : 'ذخیره فاکتور'}
        </button>
        
        {onEmail && (
          <button
            onClick={handleEmail}
            disabled={!validation.isValid}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center gap-2 text-lg transition-colors shadow-lg hover:shadow-xl"
            title="ارسال فاکتور از طریق ایمیل"
            type="button"
          >
            <Mail size={20} />
            ارسال ایمیل
          </button>
        )}
        
        <button
          onClick={handlePreview}
          disabled={!validation.isValid}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg flex items-center gap-2 text-lg transition-colors shadow-lg hover:shadow-xl"
          type="button"
        >
          <Eye size={24} />
          پیش‌نمایش و چاپ
        </button>
      </div>
      
      {!validation.isValid && (
        <div className="mt-4 bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400 font-semibold mb-2 text-center">
            ⚠️ لطفاً موارد زیر را تکمیل کنید:
          </p>
          <ul className="text-red-300 text-sm space-y-1 text-right list-disc list-inside">
            {validation.errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};