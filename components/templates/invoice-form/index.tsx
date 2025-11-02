'use client';

import { useInvoiceStore } from '@/store/use-invoice-store';
import { Input, Label, Select } from '@/components/atoms';
import { RefreshCw, CreditCard } from 'lucide-react';
import { companyCards } from '@/constants/company-info';
import { formatCardNumber, formatIBAN } from '@/utils/formatter';
import { useState } from 'react';

const generateRandomInvoiceNumber = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetters = Array.from({ length: 3 }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join('');
  const randomNumbers = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${randomLetters}-${randomNumbers}`;
};

export const InvoiceForm = () => {
  const { invoice, setInvoice } = useInvoiceStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGenerateInvoiceNumber = () => {
    setInvoice({ number: generateRandomInvoiceNumber() });
    setErrors((prev) => ({ ...prev, number: '' }));
  };

  const handleCardSelect = (cardId: string) => {
    const selectedCard = companyCards.find(
      (card) => card.id === parseInt(cardId)
    );
    if (selectedCard) {
      setInvoice({
        paymentInfo: {
          cardNumber: selectedCard.cardNumber,
          cardHolderName: selectedCard.cardHolderName,
          bankName: selectedCard.bankName,
          iban: selectedCard.iban, // ✅ شماره شبا
        },
      });
      setErrors((prev) => ({
        ...prev,
        'paymentInfo.cardNumber': '',
        'paymentInfo.cardHolderName': '',
        'paymentInfo.iban': '',
      }));
    }
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setInvoice({
      paymentInfo: { ...invoice.paymentInfo, cardNumber: formatted },
    });
  };

  const handleIBANChange = (value: string) => {
    const formatted = formatIBAN(value);
    setInvoice({
      paymentInfo: { ...invoice.paymentInfo, iban: formatted },
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400 mb-4 sm:mb-6 text-center">
        فرم صدور پیش‌فاکتور - اتمیفای
      </h1>

      {/* Invoice Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
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
              setInvoice({ number: e.target.value });
              setErrors((prev) => ({ ...prev, number: '' }));
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
              setInvoice({ date: e.target.value });
              setErrors((prev) => ({ ...prev, date: '' }));
            }}
            error={errors.date}
          />
        </div>
      </div>

      {/* Customer Info */}
      <h2 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 sm:mb-4 text-right">
        اطلاعات مشتری
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <Label required>نام و نام خانوادگی</Label>
          <Input
            value={invoice.customer.name}
            onChange={(e) => {
              setInvoice({
                customer: { ...invoice.customer, name: e.target.value },
              });
              setErrors((prev) => ({ ...prev, 'customer.name': '' }));
            }}
            placeholder="نام مشتری"
            error={errors['customer.name']}
          />
        </div>
        <div>
          <Label>نام شرکت</Label>
          <Input
            value={invoice.customer.company ?? ''}
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
            value={invoice.customer.phone ?? ''}
            onChange={(e) => {
              setInvoice({
                customer: { ...invoice.customer, phone: e.target.value },
              });
              setErrors((prev) => ({ ...prev, 'customer.phone': '' }));
            }}
            placeholder="09123456789"
            error={errors['customer.phone']}
            type="tel"
            maxLength={11}
          />
        </div>
        <div>
          <Label>آدرس</Label>
          <Input
            value={invoice.customer.address ?? ''}
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
      <h2 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 sm:mb-4 text-right flex items-center gap-2">
        <CreditCard size={20} className="sm:w-6 sm:h-6" />
        <span>اطلاعات پرداخت</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="sm:col-span-2">
          <Label required>انتخاب شماره کارت</Label>
          <Select
            value={
              companyCards.find(
                (card) => card.cardNumber === invoice.paymentInfo.cardNumber
              )?.id || ''
            }
            onChange={(e) => handleCardSelect(e.target.value)}
          >
            <option value="">انتخاب کنید...</option>
            {companyCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.cardNumber} - {card.cardHolderName} ({card.bankName})
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <Label required>شماره کارت</Label>
          <Input
            value={invoice.paymentInfo.cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            placeholder="1234-5678-9012-3456"
            maxLength={19}
            readOnly
            error={errors['paymentInfo.cardNumber']}
          />
        </div>
        
        <div>
          <Label required>نام صاحب کارت</Label>
          <Input
            value={invoice.paymentInfo.cardHolderName}
            onChange={(e) =>
              setInvoice({
                paymentInfo: {
                  ...invoice.paymentInfo,
                  cardHolderName: e.target.value,
                },
              })
            }
            placeholder="نام و نام خانوادگی صاحب کارت"
            readOnly
            error={errors['paymentInfo.cardHolderName']}
          />
        </div>
        
        <div>
          <Label>نام بانک</Label>
          <Input
            value={invoice.paymentInfo.bankName ?? ''}
            onChange={(e) =>
              setInvoice({
                paymentInfo: {
                  ...invoice.paymentInfo,
                  bankName: e.target.value,
                },
              })
            }
            placeholder="نام بانک صادرکننده کارت"
            readOnly
          />
        </div>
        
        {/* ✅ فیلد شماره شبا */}
        <div className="sm:col-span-2">
          <Label>شماره شبا</Label>
          <Input
            value={invoice.paymentInfo.iban ?? ''}
            onChange={(e) => handleIBANChange(e.target.value)}
            placeholder="IR02 0160 0000 0000 0030 7454 684"
            maxLength={32}
            readOnly
            error={errors['paymentInfo.iban']}
            isRTL={false}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            شماره شبا 26 رقمی که با IR شروع می‌شود
          </p>
        </div>
      </div>
    </div>
  );
};