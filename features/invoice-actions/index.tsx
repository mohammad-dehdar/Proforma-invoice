'use client';

import { Eye, Save, Mail } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
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
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
  const [pendingExistingIndex, setPendingExistingIndex] = useState<number | null>(null);

  const validation = validateInvoice(invoice);

  const handleSave = async () => {
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join('\n');
      setErrorModal(`لطفاً خطاهای زیر را برطرف کنید:\n\n${errorMessages}`);
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
        // Show confirm modal and wait for user's choice via stateful flow
        setPendingExistingIndex(existingIndex);
        setConfirmReplaceOpen(true);
        return; // stop here; confirm handler continues the save
      } else {
        // اضافه کردن فاکتور جدید
        history.push({
          ...invoice,
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.setItem('invoice-history', JSON.stringify(history));

      // نمایش پیام موفقیت
      setSuccessModal('✅ فاکتور با موفقیت ذخیره شد!');
    } catch (error) {
      console.error('خطا در ذخیره فاکتور:', error);
      setErrorModal('❌ خطا در ذخیره فاکتور! لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReplace = () => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('localStorage در دسترس نیست');
      }
      const history = JSON.parse(
        localStorage.getItem('invoice-history') || '[]'
      );
      if (pendingExistingIndex === null) return;
      history[pendingExistingIndex] = {
        ...invoice,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('invoice-history', JSON.stringify(history));
      setSuccessModal('✅ فاکتور با موفقیت ذخیره شد!');
    } catch (error) {
      console.error('خطا در ذخیره فاکتور:', error);
      setErrorModal('❌ خطا در ذخیره فاکتور! لطفاً دوباره تلاش کنید.');
    } finally {
      setConfirmReplaceOpen(false);
      setPendingExistingIndex(null);
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join('\n');
      setErrorModal(`لطفاً خطاهای زیر را برطرف کنید:\n\n${errorMessages}`);
      return;
    }
    onPreview();
  };

  const handleEmail = () => {
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join('\n');
      setErrorModal(`لطفاً خطاهای زیر را برطرف کنید:\n\n${errorMessages}`);
      return;
    }
    if (onEmail) onEmail();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center flex-wrap">
        <Button
          onClick={handleSave}
          disabled={!validation.isValid || isSaving}
          title="ذخیره فاکتور در تاریخچه"
          type="button"
          variant="outline"
        >
          <Save size={20} />
          <span className="whitespace-nowrap">{isSaving ? 'در حال ذخیره...' : 'ذخیره فاکتور'}</span>
        </Button>

        {onEmail && (
          <Button
            onClick={handleEmail}
            disabled={!validation.isValid}
            title="ارسال فاکتور از طریق ایمیل"
            type="button"
            variant="outline"
            color="purple"
          >
            <Mail size={20} />
            <span className="whitespace-nowrap">ارسال ایمیل</span>
          </Button>
        )}

        <Button
          onClick={handlePreview}
          disabled={!validation.isValid}
          type="button"
          variant="outline"
          color="green"
        >
          <Eye size={20} />
          <span className="whitespace-nowrap">پیش‌نمایش و چاپ</span>
        </Button>
      </div>

      {!validation.isValid && (
        <div className="mt-4 bg-red-900/20 border border-red-500 rounded-lg p-3 sm:p-4">
          <p className="text-red-400 font-semibold mb-2 text-center text-sm sm:text-base">
            ⚠️ لطفاً موارد زیر را تکمیل کنید:
          </p>
          <ul className="text-red-300 text-xs sm:text-sm space-y-1 text-right list-disc list-inside sm:list-outside sm:mr-4">
            {validation.errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Modal */}
      <Modal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        title="خطا"
        size="md"
        footer={
          <Button variant="primary" onClick={() => setErrorModal(null)}>
            متوجه شدم
          </Button>
        }
      >
        <pre className="whitespace-pre-wrap text-sm leading-6">{errorModal || ''}</pre>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={!!successModal}
        onClose={() => setSuccessModal(null)}
        title="موفقیت"
        size="sm"
        footer={
          <Button variant="primary" onClick={() => setSuccessModal(null)}>
            عالی
          </Button>
        }
      >
        <p className="text-sm">{successModal}</p>
      </Modal>

      {/* Confirm Replace Modal */}
      <Modal
        isOpen={confirmReplaceOpen}
        onClose={() => {
          setConfirmReplaceOpen(false);
          setIsSaving(false);
        }}
        title="جایگزینی فاکتور"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmReplaceOpen(false);
                setIsSaving(false);
                setPendingExistingIndex(null);
              }}
            >
              انصراف
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmReplace}
            >
              جایگزین کن
            </Button>
          </>
        }
      >
        <p className="text-sm">
          فاکتور با این شماره قبلاً ذخیره شده است. آیا می‌خواهید آن را جایگزین کنید؟
        </p>
      </Modal>
    </>
  );
};