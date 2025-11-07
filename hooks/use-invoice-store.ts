import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Invoice, Service } from '@/types/type';
import { createDefaultInvoice } from '@features/invoice/utils/default-invoice';

interface InvoiceStore {
  invoice: Invoice;
  setInvoice: (updates: Partial<Invoice>) => void;
  addService: (service: Service) => void;
  editService: (id: number, service: Partial<Service>) => void;
  removeService: (id: number) => void;
  reset: () => void;
  loadInvoice: (invoice: Invoice) => void;
}

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