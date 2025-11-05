import { ObjectId, WithId } from 'mongodb';
import { getDatabase } from './mongodb';
import { Invoice } from '@/types/type';

export type InvoiceDocument = WithId<
  Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> & {
    userId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
  }
>;

export const getInvoiceCollection = async () => {
  const db = await getDatabase();
  return db.collection<InvoiceDocument>('invoices');
};

export const serializeInvoice = (invoice: InvoiceDocument): Invoice => ({
  id: invoice._id.toHexString(),
  number: invoice.number,
  date: invoice.date,
  customer: invoice.customer,
  services: invoice.services,
  paymentInfo: invoice.paymentInfo,
  discount: invoice.discount,
  tax: invoice.tax,
  notes: invoice.notes,
  createdAt: invoice.createdAt?.toISOString(),
  updatedAt: invoice.updatedAt?.toISOString(),
});
