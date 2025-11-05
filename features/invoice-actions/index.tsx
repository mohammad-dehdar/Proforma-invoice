'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Save, Mail } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useInvoiceStore } from '@/store/use-invoice-store';
import { validateInvoice } from '@/utils/validation';
import { INVOICE_DATA_UPDATED_EVENT } from '@/constants/events';

interface InvoiceActionsProps {
  onPreview: () => void;
  onEmail?: () => void;
}

export const InvoiceActions = ({ onPreview, onEmail }: InvoiceActionsProps) => {
  const { invoice } = useInvoiceStore();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);

  const validation = validateInvoice(invoice);

  const handleUnauthorized = () => {
    router.push('/login');
    router.refresh();
  };

  const triggerInvoiceUpdateEvent = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(INVOICE_DATA_UPDATED_EVENT));
    }
  };

  const persistInvoice = async (method: 'POST' | 'PUT') => {
    const endpoint =
      method === 'POST'
        ? '/api/invoices'
        : `/api/invoices/${encodeURIComponent(invoice.number)}`;

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });

    if (response.status === 401) {
      handleUnauthorized();
      return null;
    }

    if (response.status === 422) {
      const data = await response.json();
      const errorMessages = (data.errors || [])
        .map((err: { message: string }) => err.message)
        .join('\n');
      setErrorModal(
        `لطفاً خطاهای زیر را بررسی کنید:\n\n${errorMessages || 'اطلاعات وارد شده معتبر نیست.'}`
      );
      return null;
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'خطا در ذخیره فاکتور.');
    }

    const data = await response.json();
    triggerInvoiceUpdateEvent();
    setSuccessModal('✅ فاکتور با موفقیت ذخیره شد!');
    return data.invoice;
  };

  const handleSave = async () => {
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join('\n');
      setErrorModal(`لطفاً خطاهای زیر را برطرف کنید:\n\n${errorMessages}`);
      return;
    }

    setIsSaving(true);

    try {
      const result = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });

      if (result.status === 401) {
        handleUnauthorized();
        return;
      }

      if (result.status === 409) {
        setConfirmReplaceOpen(true);
        return;
      }

      if (result.status === 422) {
        const data = await result.json();
        const errorMessages = (data.errors || [])
          .map((err: { message: string }) => err.message)
          .join('\n');
        setErrorModal(
          `لطفاً خطاهای زیر را بررسی کنید:\n\n${errorMessages || 'اطلاعات وارد شده معتبر نیست.'}`
        );
        return;
      }

      if (!result.ok) {
        const data = await result.json().catch(() => ({}));
        throw new Error(data.error || 'خطا در ذخیره فاکتور.');
      }

      await result.json();
      triggerInvoiceUpdateEvent();
      setSuccessModal('✅ فاکتور با موفقیت ذخیره شد!');
    } catch (error) {
      console.error('خطا در ذخیره فاکتور:', error);
      setErrorModal('❌ خطا در ذخیره فاکتور! لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReplace = async () => {
    setIsSaving(true);

    try {
      await persistInvoice('PUT');
    } catch (error) {
      console.error('خطا در ذخیره فاکتور:', error);
      setErrorModal('❌ خطا در ذخیره فاکتور! لطفاً دوباره تلاش کنید.');
    } finally {
      setConfirmReplaceOpen(false);
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
              }}
            >
              انصراف
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmReplace}
              disabled={isSaving}
            >
              {isSaving ? 'در حال ذخیره...' : 'جایگزین کن'}
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