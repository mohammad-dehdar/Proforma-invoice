'use client';
import { useInvoiceStore } from '../../../store/use-invoice-store';
import { Input, Label, Select } from '@/components/atoms';
import { RefreshCw } from 'lucide-react';
import { companyCards } from '../../../constants/company-info';

const generateRandomInvoiceNumber = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = Array.from({ length: 3 }, () =>
        letters[Math.floor(Math.random() * letters.length)]
    ).join('');
    const randomNumbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${randomLetters}-${randomNumbers}`;
};

const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join('-') : cleaned;
};

export const InvoiceForm = () => {
    const { invoice, setInvoice } = useInvoiceStore();

    const handleGenerateInvoiceNumber = () => {
        setInvoice({ number: generateRandomInvoiceNumber() });
    };

    const handleCardSelect = (cardId: string) => {
        const selectedCard = companyCards.find(card => card.id === parseInt(cardId));
        if (selectedCard) {
            setInvoice({
                paymentInfo: {
                    cardNumber: selectedCard.cardNumber,
                    cardHolderName: selectedCard.cardHolderName,
                    bankName: selectedCard.bankName,
                }
            });
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6">
            <h1 className="text-3xl font-bold text-blue-400 mb-6 text-center">
                سیستم صدور پیش‌فاکتور - ETMIFY
            </h1>

            {/* Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <Label>شماره فاکتور *</Label>
                        <button
                            onClick={handleGenerateInvoiceNumber}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="تولید شماره فاکتور تصادفی"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                    <Input
                        value={invoice.number}
                        onChange={(e) => setInvoice({ number: e.target.value })}
                        placeholder="مثال: ABC-1234"
                    />
                </div>
                <div>
                    <Label>تاریخ *</Label>
                    <Input
                        value={invoice.date}
                        onChange={(e) => setInvoice({ date: e.target.value })}
                    />
                </div>
            </div>

            {/* Customer Info */}
            <h2 className="text-xl font-bold text-blue-400 mb-4 text-right">
                اطلاعات مشتری
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <Label>نام و نام خانوادگی *</Label>
                    <Input
                        value={invoice.customer.name}
                        onChange={(e) =>
                            setInvoice({
                                customer: { ...invoice.customer, name: e.target.value },
                            })
                        }
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
                    />
                </div>
                <div>
                    <Label>شماره تماس</Label>
                    <Input
                        value={invoice.customer.phone ?? ''}
                        onChange={(e) =>
                            setInvoice({
                                customer: { ...invoice.customer, phone: e.target.value },
                            })
                        }
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
                    />
                </div>
            </div>

            {/* Payment Info */}
            <h2 className="text-xl font-bold text-blue-400 mb-4 text-right">
                اطلاعات پرداخت
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Label>انتخاب شماره کارت *</Label>
                    <Select
                        value={companyCards.find(card =>
                            card.cardNumber === invoice.paymentInfo.cardNumber
                        )?.id || ''}
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
                    <Label>شماره کارت *</Label>
                    <Input
                        value={invoice.paymentInfo.cardNumber}
                        onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            setInvoice({
                                paymentInfo: { ...invoice.paymentInfo, cardNumber: formatted },
                            });
                        }}
                        placeholder="1234-5678-9012-3456"
                        maxLength={19}
                        readOnly
                    />
                </div>
                <div>
                    <Label>نام صاحب کارت *</Label>
                    <Input
                        value={invoice.paymentInfo.cardHolderName}
                        onChange={(e) =>
                            setInvoice({
                                paymentInfo: { ...invoice.paymentInfo, cardHolderName: e.target.value },
                            })
                        }
                        placeholder="نام و نام خانوادگی صاحب کارت"
                        readOnly
                    />
                </div>
                <div className="md:col-span-2">
                    <Label>نام بانک</Label>
                    <Input
                        value={invoice.paymentInfo.bankName ?? ''}
                        onChange={(e) =>
                            setInvoice({
                                paymentInfo: { ...invoice.paymentInfo, bankName: e.target.value },
                            })
                        }
                        placeholder="نام بانک صادرکننده کارت"
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
}
