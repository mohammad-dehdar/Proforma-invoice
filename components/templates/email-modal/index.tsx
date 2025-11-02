'use client';

import { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { Button, Input, Label } from '@/components/atoms';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceNumber: string;
}

export const EmailModal = ({ isOpen, onClose, invoiceNumber }: EmailModalProps) => {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        setSending(true);
        // شبیه‌سازی ارسال - در آینده با API واقعی جایگزین شود
        setTimeout(() => {
            alert('فاکتور با موفقیت ارسال شد!');
            setSending(false);
            setEmail('');
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-blue-400">ارسال فاکتور</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label>ایمیل گیرنده</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                        />
                    </div>

                    <div className="text-gray-400 text-sm">
                        فاکتور شماره: <span className="font-bold text-white">{invoiceNumber}</span>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            onClick={handleSend}
                            disabled={!email || sending}
                            className="flex-1"
                        >
                            <Mail size={18} />
                            {sending ? 'در حال ارسال...' : 'ارسال'}
                        </Button>
                        <Button variant="secondary" onClick={onClose}>
                            انصراف
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};