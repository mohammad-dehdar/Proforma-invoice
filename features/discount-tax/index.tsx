'use client';

import { useInvoiceStore } from '@/store/use-invoice-store';
import { Input, Label } from '@/components/ui';
import { Percent, FileText } from 'lucide-react';

export const DiscountTax = () => {
    const { invoice, setInvoice } = useInvoiceStore();

    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 sm:mb-4 text-right">
                تخفیف و مالیات
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                    <Label>
                        <Percent className="inline ml-2" size={16} />
                        درصد تخفیف
                    </Label>
                    <Input
                        type="number"
                        value={invoice.discount || 0}
                        onChange={(e) => setInvoice({ discount: parseFloat(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        placeholder="0"
                    />
                </div>

                <div>
                    <Label>
                        <Percent className="inline ml-2" size={16} />
                        درصد مالیات (ارزش افزوده)
                    </Label>
                    <Input
                        type="number"
                        value={invoice.tax || 0}
                        onChange={(e) => setInvoice({ tax: parseFloat(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        placeholder="9"
                    />
                </div>
            </div>

            <div>
                <Label>
                    <FileText className="inline ml-2" size={16} />
                    یادداشت‌های اضافی
                </Label>
                <textarea
                    value={invoice.notes || ''}
                    onChange={(e) => setInvoice({ notes: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 sm:px-4 sm:py-2 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base resize-y"
                    placeholder="توضیحات اضافی درباره فاکتور..."
                />
            </div>
        </div>
    );
};