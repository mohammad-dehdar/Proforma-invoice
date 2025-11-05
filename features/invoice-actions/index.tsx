'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { Eye, Save, Mail } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useInvoiceStore } from '@/store/use-invoice-store';
import { validateInvoice } from '@/utils/validation';

interface InvoiceActionsProps {
  onPreview: () => void;
  onEmail?: () => void;
}

export const InvoiceActions = ({ onPreview, onEmail }: InvoiceActionsProps) => {
  const { invoice, setInvoice } = useInvoiceStore(
    useShallow((state) => ({
      invoice: state.invoice,
      setInvoice: state.setInvoice,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
  const [pendingInvoiceId, setPendingInvoiceId] = useState<string | null>(null);
  const router = useRouter();

  const validation = validateInvoice(invoice);

  const buildPayload = () => ({
    number: invoice.number,
    date: invoice.date,
    customer: invoice.customer,
    services: invoice.services,
    paymentInfo: invoice.paymentInfo,
    discount: invoice.discount ?? 0,
    tax: invoice.tax ?? 0,
    notes: invoice.notes ?? '',
  });

  const handleSave = async () => {
    if (!validation.isValid) {
      const errorMessages = validation.errors.map((e) => e.message).join('\n');
      setErrorModal(`لطفاً خطاهای زیر را برطرف کنید:\n\n${errorMessages}`);
      return;
    }

    setIsSaving(true);

    try {
      const payload = buildPayload();
      const endpoint = invoice._id ? `/api/invoices/${invoice._id}` : '/api/invoices';
      const method = invoice._id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        router.replace('/login');
        return;
      }

      if (response.status === 409) {
        const data = await response.json();
        setPendingInvoiceId(data.invoiceId || null);
        setConfirmReplaceOpen(true);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'خطا در ذخیره فاکتور' }));
        throw new Error(data.message || 'خطا در ذخیره فاکتور');
      }

      const data = await response.json();
      if (data.invoice) {
        setInvoice(data.invoice);
      }

      window.dispatchEvent(new Event('invoice:saved'));
      setSuccessModal('✅ فاکتور با موفقیت ذخیره شد!');
    } catch (error) {
      console.error('خطا در ذخیره فاکتور:', error);
      setErrorModal('❌ خطا در ذخیره فاکتور! لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReplace = async () => {
    if (!pendingInvoiceId) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/invoices/${pendingInvoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(buildPayload()),
      });

      if (response.status === 401) {
        router.replace('/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'خطا در بروزرسانی فاکتور' }));
        throw new Error(data.message || 'خطا در بروزرسانی فاکتور');
      }

      const data = await response.json();
      if (data.invoice) {
        setInvoice(data.invoice);
      }

      window.dispatchEvent(new Event('invoice:saved'));
      setSuccessModal('✅ فاکتور با موفقیت ذخیره شد!');
    } catch (error) {
      console.error('خطا در ذخیره فاکتور:', error);
      setErrorModal('❌ خطا در ذخیره فاکتور! لطفاً دوباره تلاش کنید.');
    } finally {
      setConfirmReplaceOpen(false);
      setPendingInvoiceId(null);
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!validation.isValid) {
      const errorMessages = validation.errors.map((e) => e.message).join('\n');
      setErrorModal(`لطفاً خطاهای زیر را برطرف کنید:\n\n${errorMessages}`);
      return;
    }
    onPreview();
  };

  const handleEmail = () => {
    if (!validation.isValid) {
      const errorMessages = validation.errors.map((e) => e.message).join('\n');
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

      <Modal
        isOpen={confirmReplaceOpen}
        onClose={() => {
          setConfirmReplaceOpen(false);
          setPendingInvoiceId(null);
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
                setPendingInvoiceId(null);
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
