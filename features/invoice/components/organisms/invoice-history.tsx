"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, Eye, Pencil } from 'lucide-react';

import { Button } from '@atoms';
import { Modal } from '@molecules';
import { deleteInvoice as deleteInvoiceRequest, fetchInvoices as fetchInvoiceList } from '@services/invoice-service';
import {
    formatNumber,
    formatPrice,
    calculateSubtotal,
    calculateTotal,
    calculateDiscount,
    calculateTax,
} from '@/utils/formatter';
import { Invoice } from '@/types/type';
import { useInvoiceStore } from '@/store/use-invoice-store';

interface InvoiceHistoryProps {
    onNavigateToInvoice?: () => void;
}

export const InvoiceHistory = ({ onNavigateToInvoice }: InvoiceHistoryProps) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const { loadInvoice } = useInvoiceStore();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<null | string>(null);
    const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
    const [infoModal, setInfoModal] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    const loadInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchInvoiceList();

            if (result.unauthorized) {
                setLoading(false);
                router.replace('/login');
                return;
            }

            setInvoices(result.invoices);
            setError(null);
        } catch (err) {
            console.error('Error loading invoice history:', err);
            setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadInvoices();
        const refreshHandler = () => loadInvoices();
        window.addEventListener('invoice:saved', refreshHandler);
        window.addEventListener('invoice:deleted', refreshHandler);
        return () => {
            window.removeEventListener('invoice:saved', refreshHandler);
            window.removeEventListener('invoice:deleted', refreshHandler);
        };
    }, [loadInvoices]);

    const handleDelete = (invoiceId: string) => {
        setConfirmDeleteOpen(invoiceId);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteOpen) return;
        try {
            const result = await deleteInvoiceRequest(confirmDeleteOpen);

            if (result.unauthorized) {
                setConfirmDeleteOpen(null);
                router.replace('/login');
                return;
            }

            setInvoices((prev) => prev.filter((inv) => inv._id !== confirmDeleteOpen));
            window.dispatchEvent(new Event('invoice:deleted'));
        } catch (err) {
            console.error('Error deleting invoice:', err);
            setError('خطا در حذف فاکتور. لطفاً دوباره تلاش کنید.');
        } finally {
            setConfirmDeleteOpen(null);
        }
    };

    const invoicePendingDeletion = confirmDeleteOpen
        ? invoices.find((inv) => inv._id === confirmDeleteOpen)
        : null;

    const viewInvoiceSubtotal = viewInvoice ? calculateSubtotal(viewInvoice.services) : 0;
    const viewInvoiceDiscount = viewInvoice
        ? calculateDiscount(viewInvoiceSubtotal, viewInvoice.discount ?? 0)
        : 0;
    const viewInvoiceTax = viewInvoice
        ? calculateTax(viewInvoiceSubtotal - viewInvoiceDiscount, viewInvoice.tax ?? 0)
        : 0;
    const viewInvoiceTotal = viewInvoice
        ? calculateTotal(viewInvoiceSubtotal, viewInvoice.discount ?? 0, viewInvoice.tax ?? 0)
        : 0;

    return (
        <>
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-400">تاریخچه فاکتورها</h2>
                    <p className="text-gray-400 text-sm sm:text-base">
                        تعداد کل: <span className="font-bold text-white">{formatNumber(invoices.length)}</span>
                    </p>
                </div>

                {loading ? (
                    <div className="bg-gray-800 rounded-lg p-8 sm:p-12 text-center">
                        <FileText size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-600 mb-3 sm:mb-4 animate-pulse" />
                        <p className="text-gray-400 text-base sm:text-lg">در حال بارگذاری...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center text-red-200">
                        {error}
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-8 sm:p-12 text-center">
                        <FileText size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-600 mb-3 sm:mb-4" />
                        <p className="text-gray-400 text-base sm:text-lg">هنوز فاکتوری ثبت نشده است</p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {invoices.map((invoice) => {
                            const subtotal = calculateSubtotal(invoice.services);
                            const total = calculateTotal(subtotal, invoice.discount ?? 0, invoice.tax ?? 0);
                            return (
                                <div
                                    key={invoice._id ?? invoice.number}
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
                                                <Button
                                                    onClick={() => setViewInvoice(invoice)}
                                                    title="مشاهده"
                                                    type="button"
                                                    variant="ghost"
                                                    color="blue"
                                                    size="sm"
                                                >
                                                    <Eye size={18} />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        loadInvoice(invoice);
                                                        if (onNavigateToInvoice) {
                                                            onNavigateToInvoice();
                                                        } else {
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            setInfoModal('فاکتور برای ویرایش بارگذاری شد. به بخش فاکتور جدید بروید.');
                                                        }
                                                    }}
                                                    title="ویرایش"
                                                    type="button"
                                                    variant="ghost"
                                                    color="green"
                                                    size="sm"
                                                >
                                                    <Pencil size={18} />
                                                </Button>
                                                <Button
                                                    onClick={() => invoice._id && handleDelete(invoice._id)}
                                                    title="حذف"
                                                    type="button"
                                                    variant="ghost"
                                                    color="red"
                                                    size="sm"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
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

            {/* Invoice View Modal */}
            <Modal
                isOpen={!!viewInvoice}
                onClose={() => setViewInvoice(null)}
                title={viewInvoice ? `فاکتور ${viewInvoice.number}` : 'مشاهده فاکتور'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setViewInvoice(null)}>
                            بستن
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (!viewInvoice) return;
                                loadInvoice(viewInvoice);
                                setViewInvoice(null);
                                if (onNavigateToInvoice) {
                                    onNavigateToInvoice();
                                } else {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    setInfoModal('فاکتور برای ویرایش بارگذاری شد. به بخش فاکتور جدید بروید.');
                                }
                            }}
                        >
                            ویرایش فاکتور
                        </Button>
                    </>
                }
            >
                {viewInvoice && (
                    <div className="space-y-5 text-sm sm:text-base">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4">
                                <p className="text-gray-400 text-xs sm:text-sm mb-1">شماره فاکتور</p>
                                <p className="text-white text-lg font-bold break-words">{viewInvoice.number}</p>
                            </div>
                            <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4">
                                <p className="text-gray-400 text-xs sm:text-sm mb-1">تاریخ</p>
                                <p className="text-white text-lg font-bold">{viewInvoice.date}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4 space-y-2">
                                <h4 className="text-white font-semibold text-base">مشخصات مشتری</h4>
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm mb-1">نام</p>
                                    <p className="text-white font-medium break-words">{viewInvoice.customer.name}</p>
                                </div>
                                {viewInvoice.customer.company && (
                                    <div>
                                        <p className="text-gray-400 text-xs sm:text-sm mb-1">شرکت</p>
                                        <p className="text-gray-100 break-words">{viewInvoice.customer.company}</p>
                                    </div>
                                )}
                                {viewInvoice.customer.phone && (
                                    <div>
                                        <p className="text-gray-400 text-xs sm:text-sm mb-1">تلفن</p>
                                        <p className="text-gray-100">{viewInvoice.customer.phone}</p>
                                    </div>
                                )}
                                {viewInvoice.customer.address && (
                                    <div>
                                        <p className="text-gray-400 text-xs sm:text-sm mb-1">آدرس</p>
                                        <p className="text-gray-100 leading-relaxed break-words">
                                            {viewInvoice.customer.address}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4 space-y-2">
                                <h4 className="text-white font-semibold text-base">اطلاعات پرداخت</h4>
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm mb-1">شماره کارت</p>
                                    <p className="text-gray-100 font-mono break-words">{viewInvoice.paymentInfo.cardNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm mb-1">صاحب کارت</p>
                                    <p className="text-gray-100 break-words">
                                        {viewInvoice.paymentInfo.cardHolderName}
                                    </p>
                                </div>
                                {viewInvoice.paymentInfo.bankName && (
                                    <div>
                                        <p className="text-gray-400 text-xs sm:text-sm mb-1">نام بانک</p>
                                        <p className="text-gray-100 break-words">{viewInvoice.paymentInfo.bankName}</p>
                                    </div>
                                )}
                                {viewInvoice.paymentInfo.iban && (
                                    <div>
                                        <p className="text-gray-400 text-xs sm:text-sm mb-1">شماره شبا</p>
                                        <p className="text-gray-100 font-mono break-all">{viewInvoice.paymentInfo.iban}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold text-base mb-3">خدمات</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {viewInvoice.services.map((service, index) => (
                                    <div
                                        key={`${service.id}-${index}`}
                                        className="bg-gray-900/30 border border-gray-700 rounded-lg p-3 sm:p-4"
                                    >
                                        <div className="flex justify-between items-center text-xs sm:text-sm text-gray-400 mb-2">
                                            <span>ردیف {formatNumber(index + 1)}</span>
                                            <span>تعداد: {formatNumber(service.quantity)}</span>
                                        </div>
                                        <p className="text-white font-medium mb-1 break-words">{service.description}</p>
                                        {service.additionalDescription && (
                                            <p className="text-gray-300 text-xs sm:text-sm mb-2 break-words">
                                                {service.additionalDescription}
                                            </p>
                                        )}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                                            <span className="text-gray-300">
                                                قیمت واحد: {formatPrice(service.price)} تومان
                                            </span>
                                            <span className="text-green-400 font-semibold">
                                                مبلغ کل: {formatPrice(service.price * service.quantity)} تومان
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {viewInvoice.services.length === 0 && (
                                    <div className="text-gray-300 text-sm">خدمتی ثبت نشده است.</div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">جمع خدمات</span>
                                    <span className="text-white font-semibold">
                                        {formatPrice(viewInvoiceSubtotal)} تومان
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">تخفیف ({formatNumber(viewInvoice.discount ?? 0)}%)</span>
                                    <span className="text-orange-400 font-semibold">
                                        {formatPrice(viewInvoiceDiscount)} تومان
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">مالیات ({formatNumber(viewInvoice.tax ?? 0)}%)</span>
                                    <span className="text-yellow-400 font-semibold">
                                        {formatPrice(viewInvoiceTax)} تومان
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4 flex flex-col justify-between">
                                <span className="text-gray-300 text-sm">مبلغ نهایی</span>
                                <span className="text-2xl font-bold text-green-400">
                                    {formatPrice(viewInvoiceTotal)} تومان
                                </span>
                            </div>
                        </div>

                        {viewInvoice.notes && (
                            <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4">
                                <p className="text-gray-400 text-xs sm:text-sm mb-2">توضیحات</p>
                                <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                                    {viewInvoice.notes}
                                </p>
                            </div>
                        )}
                    </div>
                )}
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
                <p className="text-sm">آیا از حذف فاکتور {invoicePendingDeletion?.number || ''} مطمئن هستید؟</p>
            </Modal>
        </>
    );
};