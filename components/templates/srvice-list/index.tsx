'use client';

import { useState } from 'react';
import { Plus, Check, X, Edit2, Trash2 } from 'lucide-react';
import { useInvoiceStore } from '@/store/use-invoice-store';
import { formatPrice, parsePrice, formatNumber } from '@/utils/formatter';
import { Service } from '@/types/type';
import { Input, Label } from '@/components/atoms';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateService = (service: Service): boolean => {
    const newErrors: Record<string, string> = {};

    if (!service.description.trim()) {
      newErrors.description = 'شرح خدمات الزامی است';
    }

    if (!service.quantity || service.quantity <= 0) {
      newErrors.quantity = 'تعداد باید بیشتر از صفر باشد';
    }

    if (!service.price || service.price <= 0) {
      newErrors.price = 'قیمت باید بیشتر از صفر باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddService = () => {
    if (validateService(currentService)) {
      addService({
        ...currentService,
        id: Date.now(), // استفاده از timestamp برای ID منحصر به فرد
      });
      setCurrentService({
        id: 0,
        description: '',
        quantity: 1,
        price: 0,
      });
      setErrors({});
    }
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditingService({ ...service });
    setErrors({});
  };

  const saveEdit = () => {
    if (validateService(editingService)) {
      editService(editingId!, editingService);
      setEditingId(null);
      setErrors({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingService({ id: 0, description: '', quantity: 1, price: 0 });
    setErrors({});
  };

  const calculateTotal = (): number => {
    return invoice.services.reduce(
      (total: number, service: Service) =>
        total + service.quantity * service.price,
      0
    );
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-blue-400 mb-4 text-right">
          افزودن خدمات
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label required>شرح خدمات</Label>
            <Input
              type="text"
              value={currentService.description}
              onChange={(e) => {
                setCurrentService({
                  ...currentService,
                  description: e.target.value,
                });
                setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="توضیحات خدمات"
              onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
              error={errors.description}
            />
          </div>
          <div>
            <Label required>تعداد</Label>
            <Input
              type="number"
              value={currentService.quantity}
              onChange={(e) => {
                setCurrentService({
                  ...currentService,
                  quantity: parseInt(e.target.value) || 1,
                });
                setErrors((prev) => ({ ...prev, quantity: '' }));
              }}
              min="1"
              error={errors.quantity}
            />
          </div>
          <div>
            <Label required>قیمت واحد (تومان)</Label>
            <Input
              type="text"
              value={formatPrice(currentService.price)}
              onChange={(e) => {
                setCurrentService({
                  ...currentService,
                  price: parsePrice(e.target.value),
                });
                setErrors((prev) => ({ ...prev, price: '' }));
              }}
              placeholder="0"
              onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
              error={errors.price}
            />
          </div>
        </div>
        <button
          onClick={handleAddService}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 mr-auto transition-colors"
          type="button"
        >
          <Plus size={20} />
          افزودن به لیست
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-blue-400 mb-4 text-right">
          لیست خدمات
        </h2>
        {invoice.services.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-700/50 rounded-lg p-8 inline-block">
              <p className="text-gray-400 text-lg">هیچ خدمتی اضافه نشده است</p>
              <p className="text-gray-500 text-sm mt-2">
                از فرم بالا برای افزودن خدمات استفاده کنید
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-gray-300 font-semibold">ردیف</th>
                  <th className="p-3 text-gray-300 font-semibold">
                    شرح خدمات
                  </th>
                  <th className="p-3 text-gray-300 font-semibold">تعداد</th>
                  <th className="p-3 text-gray-300 font-semibold">قیمت واحد</th>
                  <th className="p-3 text-gray-300 font-semibold">جمع</th>
                  <th className="p-3 text-gray-300 font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {invoice.services.map((service: Service, index: number) => (
                  <tr
                    key={service.id}
                    className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-3 text-white">{formatNumber(index + 1)}</td>
                    <td className="p-3 text-white">
                      {editingId === service.id ? (
                        <input
                          type="text"
                          value={editingService.description}
                          onChange={(e) =>
                            setEditingService({
                              ...editingService,
                              description: e.target.value,
                            })
                          }
                          className="w-full bg-gray-600 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          onChange={(e) =>
                            setEditingService({
                              ...editingService,
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full bg-gray-600 text-white rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          onChange={(e) =>
                            setEditingService({
                              ...editingService,
                              price: parsePrice(e.target.value),
                            })
                          }
                          className="w-full bg-gray-600 text-white rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        formatPrice(service.price)
                      )}
                    </td>
                    <td className="p-3 text-white font-bold">
                      {editingId === service.id
                        ? formatPrice(editingService.price * editingService.quantity)
                        : formatPrice(service.quantity * service.price)}
                    </td>
                    <td className="p-3">
                      {editingId === service.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="text-green-500 hover:text-green-400 p-1 rounded hover:bg-green-500/10 transition-colors"
                            title="ذخیره"
                            type="button"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-400 hover:text-gray-300 p-1 rounded hover:bg-gray-600/50 transition-colors"
                            title="انصراف"
                            type="button"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(service)}
                            className="text-blue-500 hover:text-blue-400 p-1 rounded hover:bg-blue-500/10 transition-colors"
                            title="ویرایش"
                            type="button"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  'آیا از حذف این خدمت اطمینان دارید؟'
                                )
                              ) {
                                removeService(service.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                            title="حذف"
                            type="button"
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

        {invoice.services.length > 0 && (
          <div className="mt-6 border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center text-right">
              <div className="text-xl text-gray-300">جمع کل:</div>
              <div className="text-2xl font-bold text-blue-400">
                {formatPrice(calculateTotal())} تومان
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};