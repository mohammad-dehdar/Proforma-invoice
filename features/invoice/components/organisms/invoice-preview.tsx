"use client";

import { useRef, useMemo } from "react";
import { Download, FileText, CreditCard, User } from "lucide-react";
import Image from "next/image";

import { Button } from "@atoms";
import { companyInfo } from "@/constants/company-info";
import { calculateDiscount, calculateSubtotal, calculateTax, calculateTotal, formatNumber, formatPrice } from "@/utils/formatter";
import { useInvoiceStore } from "@/store/use-invoice-store";
import { Service } from "@/types/type";

interface InvoicePreviewProps {
  setShowPreview: (show: boolean) => void;
  handlePrint: () => void;
}

export const InvoicePreview = ({ setShowPreview, handlePrint }: InvoicePreviewProps) => {
  const { invoice } = useInvoiceStore();
  const printRef = useRef<HTMLDivElement>(null);

  const { subtotal, discountValue, taxValue, total } = useMemo(() => {
    const computedSubtotal = calculateSubtotal(invoice.services);
    const computedDiscount = calculateDiscount(computedSubtotal, invoice.discount ?? 0);
    const taxableAmount = computedSubtotal - computedDiscount;
    const computedTax = calculateTax(taxableAmount, invoice.tax ?? 0);

    return {
      subtotal: computedSubtotal,
      discountValue: computedDiscount,
      taxValue: computedTax,
      total: calculateTotal(computedSubtotal, invoice.discount ?? 0, invoice.tax ?? 0),
    };
  }, [invoice]);

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-stone-50 to-slate-100 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        {/* Action Buttons */}
        <div className="no-print mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button
            onClick={() => setShowPreview(false)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
            type="button"
            variant="filled"
            color="gray"
          >
            بازگشت به ویرایش
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-lg flex items-center justify-center gap-2 sm:gap-3 font-medium text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
            type="button"
            variant="filled"
            color="green"
          >
            <Download size={18} className="sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">چاپ / ذخیره PDF</span>
          </Button>
        </div>

        {/* Invoice Container */}
        <div
          ref={printRef}
          className="print-container bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-5xl mx-auto overflow-hidden"
          dir="rtl"
        >
          {/* Header with Elegant Design */}
          <div className="relative bg-linear-to-l from-slate-900 via-slate-800 to-slate-900 px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10">
            <div className="flex justify-between items-start gap-4">
              <div className="text-white flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 tracking-tight">اتمیفای</h1>
                <p className="text-slate-300 text-xs sm:text-sm font-light tracking-wide">فرم پیش فاکتور خرید محصول</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-white/20 shrink-0">
                <Image
                  src={companyInfo.logo || "/placeholder.svg"}
                  alt={companyInfo.name}
                  width={80}
                  height={40}
                  className="h-10 w-auto sm:h-12 md:h-14 object-contain"
                />
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-l from-emerald-500 via-teal-500 to-emerald-600"></div>
          </div>

          <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
            {/* Invoice Title & Details */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
              <div className="bg-slate-900 p-2 sm:p-3 rounded-lg shrink-0">
                <FileText className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">فاکتور فروش</h2>
                <p className="text-slate-500 text-xs sm:text-sm">جزئیات تراکنش مالی</p>
              </div>
            </div>

            {/* Invoice Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
              <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-xl">
                <p className="text-slate-500 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">شماره فاکتور</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 break-words">{invoice.number}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-xl">
                <p className="text-slate-500 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">تاریخ صدور</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900">{invoice.date}</p>
              </div>
            </div>

            {/* Customer & Payment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
              {/* Customer Info */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 sm:p-5 md:p-6 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-blue-200">
                  <div className="bg-blue-600 p-2 rounded-lg shrink-0">
                    <User className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">مشخصات خریدار</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-slate-500 text-xs mb-1 font-medium">نام و نام خانوادگی</p>
                    <p className="text-slate-900 font-semibold text-sm sm:text-base break-words">{invoice.customer.name}</p>
                  </div>
                  {invoice.customer.company && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1 font-medium">نام شرکت</p>
                      <p className="text-slate-900 font-semibold text-sm sm:text-base break-words">{invoice.customer.company}</p>
                    </div>
                  )}
                  {invoice.customer.phone && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1 font-medium">شماره تماس</p>
                      <p className="text-slate-900 font-semibold text-sm sm:text-base">{invoice.customer.phone}</p>
                    </div>
                  )}
                  {invoice.customer.address && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1 font-medium">آدرس</p>
                      <p className="text-slate-900 font-semibold text-sm sm:text-base leading-relaxed break-words">{invoice.customer.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4 sm:p-5 md:p-6 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-emerald-200">
                  <div className="bg-emerald-600 p-2 rounded-lg shrink-0">
                    <CreditCard className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">اطلاعات پرداخت</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-slate-500 text-xs mb-1 font-medium">شماره کارت</p>
                    <p className="text-slate-900 font-semibold font-mono tracking-wider text-xs sm:text-sm break-all">
                      {invoice.paymentInfo.cardNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1 font-medium">صاحب کارت</p>
                    <p className="text-slate-900 font-semibold text-sm sm:text-base break-words">{invoice.paymentInfo.cardHolderName}</p>
                  </div>
                  {invoice.paymentInfo.bankName && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1 font-medium">نام بانک</p>
                      <p className="text-slate-900 font-semibold text-sm sm:text-base break-words">{invoice.paymentInfo.bankName}</p>
                    </div>
                  )}
                  {invoice.paymentInfo.iban && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1 font-medium">شماره شبا</p>
                      <p className="text-slate-900 font-semibold text-xs sm:text-sm break-all">{invoice.paymentInfo.iban}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Services Table */}
            <div className="mb-6 sm:mb-8 overflow-hidden rounded-xl border border-slate-200">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900">
                      <th className="p-3 sm:p-4 text-right text-white font-semibold text-xs sm:text-sm">ردیف</th>
                      <th className="p-3 sm:p-4 text-right text-white font-semibold text-xs sm:text-sm">شرح خدمات</th>
                      <th className="p-3 sm:p-4 text-center text-white font-semibold text-xs sm:text-sm">تعداد</th>
                      <th className="p-3 sm:p-4 text-right text-white font-semibold text-xs sm:text-sm">قیمت واحد</th>
                      <th className="p-3 sm:p-4 text-right text-white font-semibold text-xs sm:text-sm">مبلغ کل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.services.map((service: Service, index: number) => (
                      <tr key={service.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-3 sm:p-4 text-slate-600 font-medium text-xs sm:text-sm">{formatNumber(index + 1)}</td>
                        <td className="p-3 sm:p-4 text-slate-900 font-medium text-xs sm:text-sm">
                          <div>
                            <div>{service.description}</div>
                            {service.additionalDescription && (
                              <div className="text-slate-500 text-xs mt-1">{service.additionalDescription}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-center text-slate-600 font-medium text-xs sm:text-sm">{formatNumber(service.quantity)}</td>
                        <td className="p-3 sm:p-4 text-slate-600 font-medium text-xs sm:text-sm">{formatPrice(service.price)} تومان</td>
                        <td className="p-3 sm:p-4 text-slate-900 font-bold text-xs sm:text-sm">
                          {formatPrice(service.quantity * service.price)} تومان
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3 p-3 sm:p-4">
                {invoice.services.map((service: Service, index: number) => (
                  <div key={service.id} className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-500 text-xs font-medium">ردیف #{formatNumber(index + 1)}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-500 text-xs">شرح:</span>{' '}
                        <span className="text-slate-900 font-medium">{service.description}</span>
                      </div>
                      {service.additionalDescription && (
                        <div>
                          <span className="text-slate-500 text-xs">توضیحات اضافه:</span>{' '}
                          <span className="text-slate-600 text-xs">{service.additionalDescription}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-1">
                          <span className="text-slate-500 text-xs">تعداد:</span>{' '}
                          <span className="text-slate-600 font-medium">{formatNumber(service.quantity)}</span>
                        </div>
                        <div className="col-span-3 text-left">
                          <span className="text-slate-500 text-xs">قیمت واحد:</span>{' '}
                          <span className="text-slate-600 font-medium">{formatPrice(service.price)}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-slate-500 text-xs">مبلغ کل:</span>{' '}
                        <span className="text-slate-900 font-bold">{formatPrice(service.quantity * service.price)} تومان</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 md:p-6 rounded-xl mb-4 sm:mb-6 space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-slate-600 font-medium text-sm sm:text-base">جمع کل خدمات:</span>
                  <span className="text-slate-900 font-bold text-base sm:text-lg">{formatPrice(subtotal)} تومان</span>
              </div>
              {invoice.discount && invoice.discount > 0 && (
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-slate-600 text-sm sm:text-base">تخفیف ({invoice.discount}%):</span>
                  <span className="text-red-600 font-bold text-sm sm:text-base">-{formatPrice(discountValue)} تومان</span>
                </div>
              )}
              {invoice.tax && invoice.tax > 0 && (
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-slate-600 text-sm sm:text-base">مالیات ({invoice.tax}%):</span>
                  <span className="text-yellow-600 font-bold text-sm sm:text-base">+{formatPrice(taxValue)} تومان</span>
                </div>
              )}
            </div>

            {/* Total Amount */}
            <div className="bg-linear-to-l from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-7 md:p-8 rounded-xl mb-6 sm:mb-8">
              <div className="flex justify-between items-center">
                <div className="w-full sm:w-auto">
                  <p className="text-slate-300 text-xs sm:text-sm mb-1">جمع کل قابل پرداخت</p>
                  <p className="text-white text-2xl sm:text-3xl font-bold break-words">{formatPrice(total)} تومان</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && invoice.notes.trim() && (
              <div className="bg-amber-50 border-r-4 border-amber-400 p-4 sm:p-5 md:p-6 rounded-xl mb-6 sm:mb-8">
                <h3 className="text-amber-900 font-bold mb-2 text-sm sm:text-base">یادداشت:</h3>
                <p className="text-amber-800 leading-relaxed whitespace-pre-line text-xs sm:text-sm break-words">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 sm:pt-6 md:pt-8 border-t-2 border-slate-200 text-center">
              <p className="text-slate-900 text-base sm:text-lg font-semibold mb-2 sm:mb-3">با تشکر از اعتماد شما</p>
              <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 text-slate-600 text-xs sm:text-sm flex-wrap">
                <span className="break-all">{companyInfo.website}</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full shrink-0"></span>
                <span className="break-all">{companyInfo.email}</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full shrink-0"></span>
                <span>{companyInfo.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
  @media print {
    .no-print {
      display: none !important;
    }

    @page {
      size: A4;
      margin: 8mm 10mm;
    }

    html,
    body {
      background: #ffffff !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .print-container {
      --invoice-print-scale: 0.88;
      --invoice-print-width: 210mm;
      width: calc(var(--invoice-print-width) / var(--invoice-print-scale));
      max-width: calc(var(--invoice-print-width) / var(--invoice-print-scale));
      margin: 0 auto !important;
      background: #ffffff !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      transform: scale(var(--invoice-print-scale));
      transform-origin: top center;
      page-break-inside: avoid !important;
    }

    .print-container > * {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .print-container table,
    .print-container tr,
    .print-container td,
    .print-container th {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .print-container .absolute {
      display: none !important;
    }
  }
`}</style>
    </>
  )
}
