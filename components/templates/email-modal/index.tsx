'use client';

import { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { Button, Input, Label } from '@/components/atoms';
import { isValidEmail } from '@/utils/validation';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
}

export const EmailModal = ({
  isOpen,
  onClose,
  invoiceNumber,
}: EmailModalProps) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSend = async () => {
    // Validation
    if (!email.trim()) {
      setError('لطفاً ایمیل را وارد کنید');
      return;
    }

    if (!isValidEmail(email)) {
      setError('ایمیل معتبر نیست');
      return;
    }

    setSending(true);
    setError('');

    try {
      // شبیه‌سازی ارسال - در آینده با API واقعی جایگزین شود
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert(`✅ فاکتور با موفقیت به ${email} ارسال شد!`);
      setEmail('');
      onClose();
    } catch (err) {
      setError('خطا در ارسال ایمیل. لطفاً دوباره تلاش کنید.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setEmail('');
      setError('');
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-400">ارسال فاکتور</h3>
          <button
            onClick={handleClose}
            disabled={sending}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            aria-label="بستن"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label required>ایمیل گیرنده</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="example@email.com"
              error={error}
              disabled={sending}
              autoFocus
              isRTL={false}
            />
          </div>

          <div className="bg-gray-700 rounded p-3">
            <p className="text-gray-400 text-sm">
              فاکتور شماره:{' '}
              <span className="font-bold text-white">{invoiceNumber}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!email || sending}
              className="flex-1"
            >
              {sending ? (
                <>
                  <div className="spinner"></div>
                  در حال ارسال...
                </>
              ) : (
                <>
                  <Mail size={18} />
                  ارسال
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={sending}
            >
              انصراف
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};