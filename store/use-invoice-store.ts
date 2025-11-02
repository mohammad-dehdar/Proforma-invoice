import { create } from "zustand";
import { Invoice, Service } from "../types/type";
import { companyCards } from "../constants/company-info";

interface InvoiceStore {
  invoice: Invoice;
  setInvoice: (updates: Partial<Invoice>) => void;
  addService: (service: Service) => void;
  editService: (id: number, service: Partial<Service>) => void;
  removeService: (id: number) => void;
  reset: () => void;
  loadInvoice: (invoice: Invoice) => void; // ✅ جدید
}

export const useInvoiceStore = create<InvoiceStore>((set) => {
  const defaultCard =
    companyCards.find((card) => card.isDefault) || companyCards[0];

  const initialInvoice: Invoice = {
    number: "",
    date: new Date().toLocaleDateString("fa-IR"),
    customer: { name: "", company: "", phone: "", address: "" },
    services: [],
    paymentInfo: {
      cardNumber: defaultCard.cardNumber,
      cardHolderName: defaultCard.cardHolderName,
      bankName: defaultCard.bankName,
    },
    discount: 0, // ✅ جدید
    tax: 9, // ✅ جدید
    notes: "", // ✅ جدید
  };

  return {
    invoice: initialInvoice,

    setInvoice: (updates: Partial<Invoice>) =>
      set((state) => ({
        invoice: { ...state.invoice, ...updates },
      })),

    addService: (service: Service) =>
      set((state) => ({
        invoice: {
          ...state.invoice,
          services: [...state.invoice.services, service],
        },
      })),

    editService: (id: number, service: Partial<Service>) =>
      set((state) => ({
        invoice: {
          ...state.invoice,
          services: state.invoice.services.map((s) =>
            s.id === id ? { ...s, ...service } : s
          ),
        },
      })),

    removeService: (id: number) =>
      set((state) => ({
        invoice: {
          ...state.invoice,
          services: state.invoice.services.filter((s) => s.id !== id),
        },
      })),

    reset: () => set({ invoice: initialInvoice }),

    // ✅ جدید: بارگذاری فاکتور از تاریخچه
    loadInvoice: (invoice: Invoice) => set({ invoice }),
  };
});
