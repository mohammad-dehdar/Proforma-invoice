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
      <div className="bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 sm:mb-4 text-right">
          افزودن خدمات
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
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
          className="mt-3 sm:mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-2 rounded flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto mr-auto transition-colors text-sm sm:text-base"
          type="button"
        >
          <Plus size={20} />
          <span className="whitespace-nowrap">افزودن به لیست</span>
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 sm:mb-4 text-right">
          لیست خدمات
        </h2>
        {invoice.services.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-gray-700/50 rounded-lg p-6 sm:p-8 inline-block max-w-full mx-2">
              <p className="text-gray-400 text-base sm:text-lg">هیچ خدمتی اضافه نشده است</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                از فرم بالا برای افزودن خدمات استفاده کنید
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {invoice.services.map((service: Service, index: number) => (
                <div
                  key={service.id}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-gray-400 text-sm">ردیف #{formatNumber(index + 1)}</div>
                    <div className="flex gap-2">
                      {editingId === service.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="text-green-500 hover:text-green-400 p-1.5 rounded hover:bg-green-500/10 transition-colors"
                            title="ذخیره"
                            type="button"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-400 hover:text-gray-300 p-1.5 rounded hover:bg-gray-600/50 transition-colors"
                            title="انصراف"
                            type="button"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(service)}
                            className="text-blue-500 hover:text-blue-400 p-1.5 rounded hover:bg-blue-500/10 transition-colors"
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
                            className="text-red-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors"
                            title="حذف"
                            type="button"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">شرح:</span>{' '}
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
                          className="w-full mt-1 bg-gray-600 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-white">{service.description}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-400">تعداد:</span>{' '}
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
                            className="w-full mt-1 bg-gray-600 text-white rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        ) : (
                          <span className="text-white">{formatNumber(service.quantity)}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-400">قیمت:</span>{' '}
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
                            className="w-full mt-1 bg-gray-600 text-white rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-white">{formatPrice(service.price)}</span>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-600">
                      <span className="text-gray-400">جمع:</span>{' '}
                      <span className="text-white font-bold">
                        {editingId === service.id
                          ? formatPrice(editingService.price * editingService.quantity)
                          : formatPrice(service.quantity * service.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-2 sm:p-3 text-gray-300 font-semibold text-xs sm:text-sm">ردیف</th>
                    <th className="p-2 sm:p-3 text-gray-300 font-semibold text-xs sm:text-sm">
                      شرح خدمات
                    </th>
                    <th className="p-2 sm:p-3 text-gray-300 font-semibold text-xs sm:text-sm">تعداد</th>
                    <th className="p-2 sm:p-3 text-gray-300 font-semibold text-xs sm:text-sm">قیمت واحد</th>
                    <th className="p-2 sm:p-3 text-gray-300 font-semibold text-xs sm:text-sm">جمع</th>
                    <th className="p-2 sm:p-3 text-gray-300 font-semibold text-xs sm:text-sm">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.services.map((service: Service, index: number) => (
                    <tr
                      key={service.id}
                      className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="p-2 sm:p-3 text-white text-xs sm:text-sm">{formatNumber(index + 1)}</td>
                      <td className="p-2 sm:p-3 text-white text-xs sm:text-sm">
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
                            className="w-full bg-gray-600 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                          />
                        ) : (
                          service.description
                        )}
                      </td>
                      <td className="p-2 sm:p-3 text-white text-xs sm:text-sm">
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
                            className="w-full bg-gray-600 text-white rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                            min="1"
                          />
                        ) : (
                          formatNumber(service.quantity)
                        )}
                      </td>
                      <td className="p-2 sm:p-3 text-white text-xs sm:text-sm">
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
                            className="w-full bg-gray-600 text-white rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                          />
                        ) : (
                          formatPrice(service.price)
                        )}
                      </td>
                      <td className="p-2 sm:p-3 text-white font-bold text-xs sm:text-sm">
                        {editingId === service.id
                          ? formatPrice(editingService.price * editingService.quantity)
                          : formatPrice(service.quantity * service.price)}
                      </td>
                      <td className="p-2 sm:p-3">
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
          </>
        )}

        {invoice.services.length > 0 && (
          <div className="mt-4 sm:mt-6 border-t border-gray-700 pt-3 sm:pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-right gap-2 sm:gap-0">
              <div className="text-lg sm:text-xl text-gray-300">جمع کل:</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-400">
                {formatPrice(calculateTotal())} تومان
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};