'use client';

import { useEffect, useState } from 'react';
import { FileText, Trash2, Eye } from 'lucide-react';
import { formatPrice, formatNumber } from '@/utils/formatter';
import { Invoice } from '@/types/type';
import { useInvoiceStore } from '@/store/use-invoice-store';

interface InvoiceHistoryProps {
    onNavigateToInvoice?: () => void;
}

export const InvoiceHistory = ({ onNavigateToInvoice }: InvoiceHistoryProps) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const { loadInvoice } = useInvoiceStore();

    useEffect(() => {
        const loadHistory = () => {
            try {
                const history = JSON.parse(localStorage.getItem('invoice-history') || '[]');
                setInvoices([...history].reverse()); // Show newest first
            } catch (error) {
                console.error('Error loading invoice history:', error);
            }
        };
        loadHistory();
    }, []);

    const handleDelete = (invoiceNumber: string) => {
        if (confirm(`آیا از حذف فاکتور ${invoiceNumber} مطمئن هستید؟`)) {
            try {
                const history = JSON.parse(localStorage.getItem('invoice-history') || '[]');
                const updated = history.filter((inv: Invoice) => inv.number !== invoiceNumber);
                localStorage.setItem('invoice-history', JSON.stringify(updated));
                setInvoices(updated.reverse());
            } catch (error) {
                console.error('Error deleting invoice:', error);
            }
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-blue-400">تاریخچه فاکتورها</h2>
                <p className="text-gray-400">
                    تعداد کل: <span className="font-bold text-white">{formatNumber(invoices.length)}</span>
                </p>
            </div>

            {invoices.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">هنوز فاکتوری ثبت نشده است</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {invoices.map((invoice) => {
                        const total = calculateTotal(invoice);
                        return (
                            <div
                                key={invoice.number}
                                className="bg-gray-800 rounded-lg p-6 border-r-4 border-blue-500"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FileText size={20} className="text-blue-400" />
                                            <h3 className="text-xl font-bold text-white">
                                                فاکتور: {invoice.number}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">مشتری:</p>
                                                <p className="text-white font-medium">
                                                    {invoice.customer.name}
                                                    {invoice.customer.company && (
                                                        <span className="text-gray-400 mr-2">
                                                            ({invoice.customer.company})
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">تاریخ:</p>
                                                <p className="text-white">{invoice.date}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">تعداد خدمات:</p>
                                                <p className="text-white">
                                                    {formatNumber(invoice.services.length)} مورد
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">مبلغ کل:</p>
                                                <p className="text-2xl font-bold text-green-400">
                                                    {formatPrice(total)} تومان
                                                </p>
                                            </div>
                                        </div>
                                        {((invoice.discount && invoice.discount > 0) || (invoice.tax && invoice.tax > 0)) && (
                                            <div className="mt-4 pt-4 border-t border-gray-700 flex gap-4 text-sm">
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
                                    <div className="flex gap-2 mr-4">
                                        <button
                                            onClick={() => {
                                                loadInvoice(invoice);
                                                if (onNavigateToInvoice) {
                                                    onNavigateToInvoice();
                                                } else {
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    alert('فاکتور بارگذاری شد. به بخش فاکتور جدید بروید.');
                                                }
                                            }}
                                            className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                                            title="بارگذاری و ویرایش"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(invoice.number)}
                                            className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                                            title="حذف"
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
    );
};