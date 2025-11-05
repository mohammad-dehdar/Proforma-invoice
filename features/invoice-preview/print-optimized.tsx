'use client';

import { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { formatNumber, formatPrice } from '@/utils/formatter';
import { Invoice, Service } from '@/types/type';
import { companyInfo } from '@/constants/company-info';

interface PrintOptimizedInvoiceProps {
    invoice: Invoice;
    onClose: () => void;
}

export const PrintOptimizedInvoice = ({ invoice, onClose }: PrintOptimizedInvoiceProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const calculateSubtotal = (): number => {
        return invoice.services.reduce((total, service) => total + service.quantity * service.price, 0);
    };

    const calculateTotal = (): number => {
        const subtotal = calculateSubtotal();
        const discount = subtotal * ((invoice.discount || 0) / 100);
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * ((invoice.tax || 0) / 100);
        return afterDiscount + tax;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <div className="min-h-screen bg-linear-to-br from-slate-50 via-stone-50 to-slate-100 py-4 px-2">
                {/* Action Buttons */}
                <div className="no-print mb-4 flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                        <X size={18} />
                        بازگشت
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition shadow-sm hover:shadow-md"
                    >
                        <Printer size={18} />
                        چاپ
                    </button>
                </div>

                {/* Invoice - Optimized for A4 */}
                <div
                    ref={printRef}
                    className="print-invoice bg-white rounded-lg shadow-xl max-w-4xl mx-auto"
                    dir="rtl"
                >
                    {/* Header - Compact */}
                    <div className="bg-linear-to-l from-slate-900 to-slate-800 text-white px-5 py-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold mb-0">اتمیفای</h1>
                                <p className="text-xs text-slate-300">پیش فاکتور فروش</p>
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-300">شماره:</p>
                                <p className="text-lg font-bold">{invoice.number}</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-3">
                        {/* Info Grid - Compact */}
                        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                            <div className="bg-slate-50 p-2 rounded">
                                <p className="text-slate-500 mb-0.5">تاریخ</p>
                                <p className="font-bold text-slate-900">{invoice.date}</p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded">
                                <p className="text-slate-500 mb-0.5">مشتری</p>
                                <p className="font-bold text-slate-900">{invoice.customer.name}</p>
                            </div>
                            <div className="bg-emerald-50 p-2 rounded">
                                <p className="text-slate-500 mb-0.5">کارت</p>
                                <p className="font-bold text-slate-900 text-[10px]">{invoice.paymentInfo.cardNumber}</p>
                            </div>
                        </div>

                        {/* Additional Info - Very Compact */}
                        <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                            <div>
                                {invoice.customer.company && (
                                    <p className="text-slate-600">شرکت: <span className="font-semibold">{invoice.customer.company}</span></p>
                                )}
                                {invoice.customer.phone && (
                                    <p className="text-slate-600">تلفن: <span className="font-semibold">{invoice.customer.phone}</span></p>
                                )}
                            </div>
                            <div className="text-left">
                                <p className="text-slate-600">صاحب کارت: <span className="font-semibold">{invoice.paymentInfo.cardHolderName}</span></p>
                                {invoice.paymentInfo.bankName && (
                                    <p className="text-slate-600">بانک: <span className="font-semibold">{invoice.paymentInfo.bankName}</span></p>
                                )}
                            </div>
                        </div>

                        {/* Services Table - Ultra Compact */}
                        <div className="border border-slate-200 rounded mb-2 overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-800 text-white">
                                    <tr>
                                        <th className="py-1 px-2 text-right w-8">ردیف</th>
                                        <th className="py-1 px-2 text-right">شرح</th>
                                        <th className="py-1 px-2 text-center w-12">تعداد</th>
                                        <th className="py-1 px-2 text-right w-24">قیمت واحد</th>
                                        <th className="py-1 px-2 text-right w-28">مبلغ کل</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.services.map((service: Service, index: number) => (
                                        <tr key={service.id} className="border-b border-slate-100">
                                            <td className="py-1 px-2 text-slate-600">{formatNumber(index + 1)}</td>
                                            <td className="py-1 px-2 text-slate-900">{service.description}</td>
                                            <td className="py-1 px-2 text-center text-slate-600">{formatNumber(service.quantity)}</td>
                                            <td className="py-1 px-2 text-slate-600">{formatPrice(service.price)}</td>
                                            <td className="py-1 px-2 text-slate-900 font-bold">{formatPrice(service.quantity * service.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Calculations - Compact */}
                        <div className="bg-slate-50 rounded p-2 mb-2 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-600">جمع کل:</span>
                                <span className="font-bold text-slate-900">{formatPrice(calculateSubtotal())} تومان</span>
                            </div>
                            {invoice.discount ? (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">تخفیف ({invoice.discount}%):</span>
                                    <span className="font-bold text-red-600">-{formatPrice(calculateSubtotal() * (invoice.discount / 100))} تومان</span>
                                </div>
                            ) : null}
                            {invoice.tax ? (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">مالیات ({invoice.tax}%):</span>
                                    <span className="font-bold text-yellow-600">+{formatPrice((calculateSubtotal() - (calculateSubtotal() * ((invoice.discount || 0) / 100))) * ((invoice.tax || 0) / 100))} تومان</span>
                                </div>
                            ) : null}
                        </div>

                        {/* Total - Compact */}
                        <div className="bg-slate-900 text-white rounded p-2 mb-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">مبلغ قابل پرداخت:</span>
                                <span className="text-xl font-bold">{formatPrice(calculateTotal())} تومان</span>
                            </div>
                        </div>

                        {/* Notes - If exists */}
                        {invoice.notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-2">
                                <p className="text-amber-900 font-semibold text-xs mb-0.5">یادداشت:</p>
                                <p className="text-amber-800 text-[10px] leading-tight">{invoice.notes}</p>
                            </div>
                        )}

                        {/* Footer - Minimal */}
                        <div className="border-t pt-2 text-center">
                            <p className="text-slate-900 text-xs font-semibold mb-1">با تشکر از اعتماد شما</p>
                            <div className="flex justify-center items-center gap-2 text-slate-600 text-[9px]">
                                <span>{companyInfo.phone}</span>
                                <span>•</span>
                                <span>{companyInfo.email}</span>
                                <span>•</span>
                                <span>{companyInfo.website}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .no-print {
            display: none !important;
          }

          .print-invoice {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }

          .print-invoice * {
            page-break-inside: avoid;
          }
        }
      `}</style>
        </>
    );
};