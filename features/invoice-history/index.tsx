'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, Eye } from 'lucide-react';
import { formatPrice, formatNumber } from '@/utils/formatter';
import { Invoice, InvoiceWithMeta } from '@/types/type';
import { useInvoiceStore } from '@/store/use-invoice-store';
import { Modal, Button } from '@/components/ui';
import { INVOICE_DATA_UPDATED_EVENT } from '@/constants/events';

interface InvoiceHistoryProps {
    onNavigateToInvoice?: () => void;
}

export const InvoiceHistory = ({ onNavigateToInvoice }: InvoiceHistoryProps) => {
    const [invoices, setInvoices] = useState<InvoiceWithMeta[]>([]);
    const { loadInvoice } = useInvoiceStore();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<null | string>(null);
    const [infoModal, setInfoModal] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleUnauthorized = useCallback(() => {
        router.push('/login');
        router.refresh();
    }, [router]);

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/invoices');

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'خطا در دریافت فاکتورها.');
            }

            const data = await response.json();
            setInvoices(data.invoices || []);
        } catch (error) {
            console.error('Error loading invoice history:', error);
            setErrorMessage('خطا در بارگذاری تاریخچه فاکتورها. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsLoading(false);
        }
    }, [handleUnauthorized]);

    useEffect(() => {
        fetchInvoices();

        const handleUpdate = () => {
            fetchInvoices();
        };

        window.addEventListener(INVOICE_DATA_UPDATED_EVENT, handleUpdate);

        return () => {
            window.removeEventListener(INVOICE_DATA_UPDATED_EVENT, handleUpdate);
        };
    }, [fetchInvoices]);

    const handleDelete = (invoiceNumber: string) => {
        setConfirmDeleteOpen(invoiceNumber);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteOpen) return;
        setIsDeleting(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`/api/invoices/${encodeURIComponent(confirmDeleteOpen)}`, {
                method: 'DELETE',
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'خطا در حذف فاکتور.');
            }

            setConfirmDeleteOpen(null);
            setInfoModal('✅ فاکتور مورد نظر با موفقیت حذف شد.');
            window.dispatchEvent(new Event(INVOICE_DATA_UPDATED_EVENT));
            await fetchInvoices();
        } catch (error) {
            console.error('Error deleting invoice:', error);
            setErrorMessage('خطا در حذف فاکتور. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsDeleting(false);
        }
    };

    const calculateTotal = (invoice: Invoice): number => {
        const subtotal = invoice.services.reduce(
            (sum, service) => sum + service.price * service.quantity,
            0
        );
        const discount = subtotal * ((invoice.discount || 0) / 100);
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * ((invoice.tax || 0) / 100);
        return afterDiscount + tax;
    };

    const loadInvoiceForEditing = (invoice: InvoiceWithMeta) => {
        const { _id, createdAt, updatedAt, createdBy, updatedBy, ...invoiceData } = invoice;
        loadInvoice(invoiceData);
    };

    return (
        <>
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-400">تاریخچه فاکتورها</h2>
                    <p className="text-gray-400 text-sm sm:text-base">
                        تعداد کل: <span className="font-bold text-white">{formatNumber(invoices.length)}</span>
                    </p>
                </div>

                {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500 text-red-300 text-sm rounded-lg p-3 text-right">
                        {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                                <div className="h-4 bg-gray-700 rounded w-1/3 mb-3"></div>
                                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-8 sm:p-12 text-center">
                        <FileText size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-600 mb-3 sm:mb-4" />
                        <p className="text-gray-400 text-base sm:text-lg">هنوز فاکتوری ثبت نشده است</p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {invoices.map((invoice) => {
                            const total = calculateTotal(invoice);
                            return (
                                <div
                                    key={invoice.number}
                                    className="bg-gray-800 rounded-lg p-4 sm:p-6 border-r-4 border-blue-500"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                                <FileText size={18} className="sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                                                <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                                                    فاکتور: {invoice.number}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                                                <div>
                                                    <p className="text-gray-400 text-xs sm:text-sm mb-1">مشتری:</p>
                                                    <p className="text-white font-medium text-sm sm:text-base break-words">
                                                        {invoice.customer.name}
                                                        {invoice.customer.company && (
                                                            <span className="text-gray-400 mr-2">
                                                                ({invoice.customer.company})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs sm:text-sm mb-1">تاریخ:</p>
                                                    <p className="text-white text-sm sm:text-base">{invoice.date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs sm:text-sm mb-1">تعداد خدمات:</p>
                                                    <p className="text-white text-sm sm:text-base">
                                                        {formatNumber(invoice.services.length)} مورد
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs sm:text-sm mb-1">مبلغ کل:</p>
                                                    <p className="text-xl sm:text-2xl font-bold text-green-400">
                                                        {formatPrice(total)} تومان
                                                    </p>
                                                </div>
                                            </div>
                                            {((invoice.discount && invoice.discount > 0) || (invoice.tax && invoice.tax > 0)) && (
                                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                                                    {invoice.discount && invoice.discount > 0 && (
                                                        <span className="text-orange-400">
                                                            تخفیف: {invoice.discount}%
                                                        </span>
                                                    )}
                                                    {invoice.tax && invoice.tax > 0 && (
                                                        <span className="text-yellow-400">
                                                            مالیات: {invoice.tax}%
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 sm:mr-4 shrink-0 self-start sm:self-center">
                                            <button
                                                onClick={() => {
                                                    loadInvoiceForEditing(invoice);
                                                    if (onNavigateToInvoice) {
                                                        onNavigateToInvoice();
                                                    } else {
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        setInfoModal('فاکتور بارگذاری شد. به بخش فاکتور جدید بروید.');
                                                    }
                                                }}
                                                className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                                                title="بارگذاری و ویرایش"
                                                type="button"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(invoice.number)}
                                                className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                                                title="حذف"
                                                type="button"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Info Modal */}
            <Modal
                isOpen={!!infoModal}
                onClose={() => setInfoModal(null)}
                title="اطلاع"
                size="sm"
                footer={
                    <Button variant="primary" onClick={() => setInfoModal(null)}>
                        متوجه شدم
                    </Button>
                }
            >
                <p className="text-sm">{infoModal}</p>
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal
                isOpen={!!confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(null)}
                title="حذف فاکتور"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setConfirmDeleteOpen(null)}>
                            انصراف
                        </Button>
                        <Button variant="primary" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'در حال حذف...' : 'حذف'}
                        </Button>
                    </>
                }
            >
                <p className="text-sm">آیا از حذف فاکتور {confirmDeleteOpen || ''} مطمئن هستید؟</p>
            </Modal>
        </>
    );
};