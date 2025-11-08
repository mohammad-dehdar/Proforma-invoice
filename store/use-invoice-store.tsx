import { createContext, useContext, type ReactNode } from 'react';
import { createStore } from 'zustand/vanilla';
import { useStore, type StoreApi } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Invoice, Service } from '@/types/type';
import { createDefaultInvoice } from '@features/invoice/utils/default-invoice';

export interface InvoiceStoreState {
    invoice: Invoice;
    setInvoice: (updates: Partial<Invoice>) => void;
    addService: (service: Service) => void;
    editService: (id: number, service: Partial<Service>) => void;
    removeService: (id: number) => void;
    reset: () => void;
    loadInvoice: (invoice: Invoice) => void;
}

type CreateInvoiceStoreOptions = {
    initialInvoice?: Invoice;
    persistState?: boolean;
};

const cloneInvoice = (invoice: Invoice): Invoice => ({
    ...invoice,
    customer: { ...invoice.customer },
    paymentInfo: { ...invoice.paymentInfo },
    services: invoice.services.map((service) => ({ ...service })),
});

const createNoopStorage = () => ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
});

export const createInvoiceStore = (
    options: CreateInvoiceStoreOptions = {},
): StoreApi<InvoiceStoreState> => {
    const { initialInvoice, persistState = true } = options;
    const initialState = initialInvoice
        ? cloneInvoice(initialInvoice)
        : createDefaultInvoice();

    const storeInitializer = (set: StoreApi<InvoiceStoreState>['setState']) => ({
        invoice: initialState,

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
                        s.id === id ? { ...s, ...service } : s,
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

        reset: () =>
            set({
                invoice: initialInvoice
                    ? cloneInvoice(initialInvoice)
                    : createDefaultInvoice(),
            }),

        loadInvoice: (invoice: Invoice) => set({ invoice: cloneInvoice(invoice) }),
    });

    if (!persistState) {
        return createStore<InvoiceStoreState>()((set) => storeInitializer(set));
    }

    return createStore<InvoiceStoreState>()(
        persist(storeInitializer, {
            name: 'etmify-invoice-storage',
            storage: createJSONStorage(() =>
                typeof window !== 'undefined' ? localStorage : createNoopStorage(),
            ),
        }),
    );
};

const defaultInvoiceStore = createInvoiceStore();

const InvoiceStoreContext = createContext<StoreApi<InvoiceStoreState> | null>(
    defaultInvoiceStore,
);

export const InvoiceStoreProvider = ({
    store,
    children,
}: {
    store: StoreApi<InvoiceStoreState>;
    children: ReactNode;
}) => (
    <InvoiceStoreContext.Provider value={store}>
        {children}
    </InvoiceStoreContext.Provider>
);

export function useInvoiceStore<T = InvoiceStoreState>(
    selector?: (state: InvoiceStoreState) => T,
    equalityFn?: (a: T, b: T) => boolean,
): T {
    const store = useContext(InvoiceStoreContext) ?? defaultInvoiceStore;
    const storeSelector =
        selector ?? ((state: InvoiceStoreState) => state as unknown as T);
    return useStore(store, storeSelector, equalityFn);
}

// Attach getServerSnapshot for compatibility with useSyncExternalStore in SSR scenarios
// @ts-expect-error - augmenting the store with a custom method for SSR support
useInvoiceStore.getServerSnapshot = () => defaultInvoiceStore.getState();

