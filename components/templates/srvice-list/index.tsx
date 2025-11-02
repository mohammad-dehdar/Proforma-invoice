'use client';

import { useState } from 'react';
import { Plus, Check, X, Edit2, Trash2 } from 'lucide-react';
import { useInvoiceStore } from '../../../store/use-invoice-store';
import { formatPrice, parsePrice, formatNumber } from '../../../utils/formatter';
import { Service } from '../../../types/type';

export const ServiceList = () => {
    const { invoice, addService, editService, removeService } = useInvoiceStore();
    const [currentService, setCurrentService] = useState<Service>({
        id: 0,
        description: '',
        quantity: 1,
        price: 0,
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingService, setEditingService] = useState<Service>({
        id: 0,
        description: '',
        quantity: 1,
        price: 0,
    });

    const handleAddService = () => {
        if (currentService.description.trim() && currentService.price > 0) {
            addService({
                ...currentService,
                id: Math.floor(Math.random() * 1000000),
            });
            setCurrentService({
                id: 0,
                description: '',
                quantity: 1,
                price: 0,
            });
        }
    };

    const startEdit = (service: Service) => {
        setEditingId(service.id);
        setEditingService({ ...service });
    };

    const saveEdit = () => {
        if (editingService.description.trim() && editingService.price > 0) {
            editService(editingId!, editingService);
            setEditingId(null);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingService({ id: 0, description: '', quantity: 1, price: 0 });
    };

    const calculateTotal = (): number => {
        return invoice.services.reduce((total: number, service: Service) => total + (service.quantity * service.price), 0);
    };
    return (
        <>
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-blue-400 mb-4 text-right">افزودن خدمات</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-gray-300 mb-2 text-right">شرح خدمات *</label>
                        <input
                            type="text"
                            value={currentService.description}
                            onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                            className="w-full bg-gray-700 text-white rounded px-4 py-2 text-right"
                            placeholder="توضیحات خدمات"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2 text-right">تعداد *</label>
                        <input
                            type="number"
                            value={currentService.quantity}
                            onChange={(e) => setCurrentService({ ...currentService, quantity: parseInt(e.target.value) || 1 })}
                            className="w-full bg-gray-700 text-white rounded px-4 py-2 text-right"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2 text-right">قیمت واحد (تومان) *</label>
                        <input
                            type="text"
                            value={formatPrice(currentService.price)}
                            onChange={(e) => setCurrentService({ ...currentService, price: parsePrice(e.target.value) })}
                            className="w-full bg-gray-700 text-white rounded px-4 py-2 text-right"
                            min="0"
                            placeholder="0"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
                        />
                    </div>
                </div>
                <button
                    onClick={handleAddService}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 mr-auto"
                >
                    <Plus size={20} />
                    افزودن به لیست
                </button>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-blue-400 mb-4 text-right">لیست خدمات</h2>
                {invoice.services.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">هیچ خدمتی اضافه نشده است</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="p-3 text-gray-300">ردیف</th>
                                    <th className="p-3 text-gray-300">شرح خدمات</th>
                                    <th className="p-3 text-gray-300">تعداد</th>
                                    <th className="p-3 text-gray-300">قیمت واحد</th>
                                    <th className="p-3 text-gray-300">جمع</th>
                                    <th className="p-3 text-gray-300">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.services.map((service: Service, index: number) => (
                                    <tr key={service.id} className="border-b border-gray-700">
                                        <td className="p-3 text-white">{formatNumber(index + 1)}</td>
                                        <td className="p-3 text-white">
                                            {editingId === service.id ? (
                                                <input
                                                    type="text"
                                                    value={editingService.description}
                                                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                                    className="w-full bg-gray-600 text-white rounded px-2 py-1"
                                                />
                                            ) : (
                                                service.description
                                            )}
                                        </td>
                                        <td className="p-3 text-white">
                                            {editingId === service.id ? (
                                                <input
                                                    type="number"
                                                    value={editingService.quantity}
                                                    onChange={(e) => setEditingService({ ...editingService, quantity: parseInt(e.target.value) || 1 })}
                                                    className="w-full bg-gray-600 text-white rounded px-2 py-1 text-center"
                                                    min="1"
                                                />
                                            ) : (
                                                formatNumber(service.quantity)
                                            )}
                                        </td>
                                        <td className="p-3 text-white">
                                            {editingId === service.id ? (
                                                <input
                                                    type="text"
                                                    value={formatPrice(editingService.price)}
                                                    onChange={(e) => setEditingService({ ...editingService, price: parsePrice(e.target.value) })}
                                                    className="w-full bg-gray-600 text-white rounded px-2 py-1 text-right"
                                                />
                                            ) : (
                                                formatPrice(service.price)
                                            )}
                                        </td>
                                        <td className="p-3 text-white font-bold">
                                            {editingId === service.id ?
                                                formatPrice((parsePrice(editingService.price.toString()) * editingService.quantity).toString()) :
                                                formatPrice((service.quantity * service.price).toString())
                                            }
                                        </td>
                                        <td className="p-3">
                                            {editingId === service.id ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={saveEdit}
                                                        className="text-green-500 hover:text-green-400"
                                                        title="ذخیره"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="text-gray-400 hover:text-gray-300"
                                                        title="انصراف"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEdit(service)}
                                                        className="text-blue-500 hover:text-blue-400"
                                                        title="ویرایش"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => removeService(service.id)}
                                                        className="text-red-500 hover:text-red-400"
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center text-right">
                        <div className="text-xl text-gray-300">جمع کل:</div>
                        <div className="text-2xl font-bold text-blue-400">
                            {formatPrice(calculateTotal())} تومان
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};