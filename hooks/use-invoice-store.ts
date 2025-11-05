import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Invoice, Service } from '@/types/type';
import { companyCards } from '@/constants/company-info';
import { detectBankFromCardNumber } from '@/utils/detect-bank';

interface InvoiceStore {
  invoice: Invoice;
  setInvoice: (updates: Partial<Invoice>) => void;
  addService: (service: Service) => void;
  editService: (id: number, service: Partial<Service>) => void;
  removeService: (id: number) => void;
  reset: () => void;
  loadInvoice: (invoice: Invoice) => void;
}

// تابع کمکی برای ایجاد فاکتور پیش‌فرض
const createDefaultInvoice = (): Invoice => {
  const defaultCard = companyCards.find(card => card.isDefault) || companyCards[0];
  const detectedBankName = detectBankFromCardNumber(defaultCard.cardNumber) || '';
  
  return {
    number: '',
    date: new Date().toLocaleDateString('fa-IR'),
    customer: {
      name: '',
      company: '',
      phone: '',
      address: ''
    },
    services: [],
    paymentInfo: {
      cardNumber: defaultCard.cardNumber,
      cardHolderName: defaultCard.cardHolderName,
      bankName: detectedBankName,
      iban: defaultCard.iban
    },
    discount: 0,
    tax: 9,
    notes: ''
  };
};

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set) => ({
      invoice: createDefaultInvoice(),

      setInvoice: (updates) =>
        set((state) => ({
          invoice: { ...state.invoice, ...updates }
        })),

      addService: (service) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            services: [...state.invoice.services, service]
          }
        })),

      editService: (id, service) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            services: state.invoice.services.map((s) =>
              s.id === id ? { ...s, ...service } : s
            )
          }
        })),

      removeService: (id) =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            services: state.invoice.services.filter((s) => s.id !== id)
          }
        })),

      reset: () => set({ invoice: createDefaultInvoice() }),

      loadInvoice: (invoice) => set({ invoice })
    }),
    {
      name: 'etmify-invoice-storage',
      storage: createJSONStorage(() => {
        // بررسی دسترسی به localStorage
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Storage موقت برای SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        };
      })
    }
  )
);