'use client';

import { Eye, Save, Mail } from 'lucide-react';
import { useInvoiceStore } from '../../../store/use-invoice-store';

interface InvoiceActionsProps {
    onPreview: () => void;
    onEmail?: () => void;
}

export const InvoiceActions = ({ onPreview, onEmail }: InvoiceActionsProps) => {
    const { invoice } = useInvoiceStore();

    const isFormValid = invoice.services.length > 0 &&
        invoice.customer.name &&
        invoice.number &&
        invoice.paymentInfo.cardNumber &&
        invoice.paymentInfo.cardHolderName;

    const handleSave = () => {
        if (!isFormValid) return;

        try {
            const history = JSON.parse(localStorage.getItem('invoice-history') || '[]');
            // بررسی تکراری نبودن شماره فاکتور
            const exists = history.some((inv: typeof invoice) => inv.number === invoice.number);
            if (exists) {
                if (!confirm('فاکتور با این شماره قبلاً ذخیره شده است. آیا می‌خواهید آن را جایگزین کنید؟')) {
                    return;
                }
                // حذف فاکتور قبلی
                const filtered = history.filter((inv: typeof invoice) => inv.number !== invoice.number);
                filtered.push({ ...invoice });
                localStorage.setItem('invoice-history', JSON.stringify(filtered));
            } else {
                history.push({ ...invoice });
                localStorage.setItem('invoice-history', JSON.stringify(history));
            }
            alert('فاکتور با موفقیت ذخیره شد!');
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('خطا در ذخیره فاکتور!');
        }
    };

    return (
        <>
            <div className="flex gap-4 justify-center flex-wrap">
                <button
                    onClick={handleSave}
                    disabled={!isFormValid}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center gap-2 text-lg transition-colors"
                    title="ذخیره فاکتور در تاریخچه"
                >
                    <Save size={20} />
                    ذخیره فاکتور
                </button>
                {onEmail && (
                    <button
                        onClick={onEmail}
                        disabled={!isFormValid}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center gap-2 text-lg transition-colors"
                        title="ارسال فاکتور از طریق ایمیل"
                    >
                        <Mail size={20} />
                        ارسال ایمیل
                    </button>
                )}
                <button
                    onClick={onPreview}
                    disabled={!isFormValid}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg flex items-center gap-2 text-lg transition-colors"
                >
                    <Eye size={24} />
                    پیش‌نمایش و چاپ
                </button>
            </div>
            {!isFormValid && (
                <p className="text-center text-gray-400 mt-4">
                    لطفاً شماره فاکتور، نام مشتری، اطلاعات پرداخت و حداقل یک خدمت را وارد کنید
                </p>
            )}
        </>
    );
};