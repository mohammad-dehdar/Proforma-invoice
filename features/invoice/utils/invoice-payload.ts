import { Invoice } from '@/types/type';

export interface InvoicePayload {
  number: string;
  date: string;
  customer: Invoice['customer'];
  services: Invoice['services'];
  paymentInfo: Invoice['paymentInfo'];
  discount: number;
  tax: number;
  notes: string;
}

export const buildInvoicePayload = (invoice: Invoice): InvoicePayload => ({
  number: invoice.number,
  date: invoice.date,
  customer: invoice.customer,
  services: invoice.services,
  paymentInfo: invoice.paymentInfo,
  discount: invoice.discount ?? 0,
  tax: invoice.tax ?? 0,
  notes: invoice.notes ?? '',
});
