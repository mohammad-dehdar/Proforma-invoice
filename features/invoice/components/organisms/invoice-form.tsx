"use client";

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { Input, Label } from '@atoms';
import { CardSelector } from '@molecules';
import { useInvoiceStore } from '@/store/use-invoice-store';
import { companyCards } from '@/constants/company-info';
import { generateRandomInvoiceNumber } from '@features/invoice/utils/generate-invoice-number';
import { resolvePaymentInfoFromCard } from '@features/invoice/utils/payment-info';

export const InvoiceForm = () => {
  const { invoice, setInvoice } = useInvoiceStore()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleGenerateInvoiceNumber = () => {
    setInvoice({ number: generateRandomInvoiceNumber() })
    setErrors((prev) => ({ ...prev, number: "" }))
  }

  const handleCardSelect = (cardId: string) => {
    const selectedCard = companyCards.find((card) => card.id === Number.parseInt(cardId))
    if (selectedCard) {
      setInvoice({
        paymentInfo: resolvePaymentInfoFromCard(selectedCard),
      })
      setErrors((prev) => ({
        ...prev,
        "paymentInfo.cardNumber": "",
        "paymentInfo.cardHolderName": "",
        "paymentInfo.iban": "",
      }))
    }
  }


  return (
    <div className="bg-gray-900 rounded-lg shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400 mb-4 sm:mb-6 text-center">
        فرم صدور پیش‌فاکتور - اتمیفای
      </h1>

      {/* Invoice Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Label required>شماره فاکتور</Label>
            <button
              onClick={handleGenerateInvoiceNumber}
              className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-400/10 shrink-0"
              title="تولید شماره فاکتور تصادفی"
              type="button"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <Input
            value={invoice.number}
            onChange={(e) => {
              setInvoice({ number: e.target.value })
              setErrors((prev) => ({ ...prev, number: "" }))
            }}
            placeholder="مثال: ABC-1234"
            error={errors.number}
          />
        </div>
        <div>
          <Label required>تاریخ</Label>
          <Input
            value={invoice.date}
            onChange={(e) => {
              setInvoice({ date: e.target.value })
              setErrors((prev) => ({ ...prev, date: "" }))
            }}
            error={errors.date}
          />
        </div>
      </div>

      {/* Customer Info */}
      <h2 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 sm:mb-4 text-right">اطلاعات مشتری</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <Label required>نام و نام خانوادگی</Label>
          <Input
            value={invoice.customer.name}
            onChange={(e) => {
              setInvoice({
                customer: { ...invoice.customer, name: e.target.value },
              })
              setErrors((prev) => ({ ...prev, "customer.name": "" }))
            }}
            placeholder="نام مشتری"
            error={errors["customer.name"]}
          />
        </div>
        <div>
          <Label>نام شرکت</Label>
          <Input
            value={invoice.customer.company ?? ""}
            onChange={(e) =>
              setInvoice({
                customer: { ...invoice.customer, company: e.target.value },
              })
            }
            placeholder="نام شرکت (اختیاری)"
          />
        </div>
        <div>
          <Label>شماره تماس</Label>
          <Input
            value={invoice.customer.phone ?? ""}
            onChange={(e) => {
              setInvoice({
                customer: { ...invoice.customer, phone: e.target.value },
              })
              setErrors((prev) => ({ ...prev, "customer.phone": "" }))
            }}
            placeholder="09123456789"
            error={errors["customer.phone"]}
            type="tel"
            maxLength={11}
          />
        </div>
        <div>
          <Label>آدرس</Label>
          <Input
            value={invoice.customer.address ?? ""}
            onChange={(e) =>
              setInvoice({
                customer: { ...invoice.customer, address: e.target.value },
              })
            }
            placeholder="آدرس کامل"
          />
        </div>
      </div>

      {/* Payment Info */}
      <div className="space-y-4 sm:space-y-6">
        <CardSelector
          selectedCardNumber={invoice.paymentInfo.cardNumber}
          onCardSelect={handleCardSelect}
        />
      </div>
    </div>
  )
}
