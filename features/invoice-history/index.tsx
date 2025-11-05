'use client';

import { useEffect, useState } from 'react';
import { FileText, Trash2, Eye } from 'lucide-react';
import { formatPrice, formatNumber } from '@/utils/formatter';
import { Invoice } from '@/types/type';
import { useInvoiceStore } from '@/store/use-invoice-store';
import { Modal, Button } from '@/components/ui';

interface InvoiceHistoryProps {
    onNavigateToInvoice?: () => void;
}

export const InvoiceHistory = ({ onNavigateToInvoice }: InvoiceHistoryProps) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const { loadInvoice } = useInvoiceStore();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<null | string>(null);
    const [infoModal, setInfoModal] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadHistory = async () => {
            setIsLoading(true);

            try {
                const response = await fetch('/api/invoices');

                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }

                if (!response.ok) {
                    throw new Error('failed_to_load');
                }

                const data = await response.json();

                if (isMounted) {
                    const list: Invoice[] = data.invoices ?? [];
                    setInvoices(list);
                }
            } catch (error) {
                console.error('Error loading invoice history:', error);
                if (isMounted) {
                    setInfoModal('خطا در بارگذاری تاریخچه فاکتورها. لطفاً بعداً دوباره تلاش کنید.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadHistory();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleDelete = (invoiceId?: string) => {
        if (!invoiceId) return;
        setConfirmDeleteOpen(invoiceId);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteOpen) return;

        try {
            const response = await fetch(`/api/invoices/${confirmDeleteOpen}`, {
                method: 'DELETE',
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                throw new Error('failed_to_delete');
            }

            setInvoices((current) =>
                current.filter((invoice) => invoice.id !== confirmDeleteOpen)
            );
        } catch (error) {
            console.error('Error deleting invoice:', error);
            setInfoModal('حذف فاکتور با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
        } finally {
            setConfirmDeleteOpen(null);
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

    const selectedInvoice = confirmDeleteOpen
        ? invoices.find((invoice) => invoice.id === confirmDeleteOpen)
        : null;

    return (
        <>
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-400">تاریخچه فاکتورها</h2>
                    <p className="text-gray-400 text-sm sm:text-base">
                        تعداد کل: <span className="font-bold text-white">{formatNumber(invoices.length)}</span>
                    </p>
                </div>

                {isLoading ? (
                    <div className="space-y-3 sm:space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 rounded-lg p-4 sm:p-6 animate-pulse"
                            >
                                <div className="h-4 bg-gray-700 rounded w-1/3 mb-3"></div>
                                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
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
                                    key={invoice.id ?? invoice.number}
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
                                                        loadInvoice(invoice);
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
                                                    onClick={() => handleDelete(invoice.id)}
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
                        <Button variant="primary" onClick={confirmDelete}>
                            حذف
                        </Button>
                    </>
                }
            >
                <p className="text-sm">آیا از حذف فاکتور {selectedInvoice?.number || ''} مطمئن هستید؟</p>
            </Modal>
        </>
    );
};