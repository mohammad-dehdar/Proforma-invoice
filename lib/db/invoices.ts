import { Collection, MongoServerError, ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { Invoice, InvoiceWithMeta } from '@/types/type';

export type InvoiceDocument = Invoice & {
  _id: ObjectId;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
  updatedBy?: string;
};

export const getInvoicesCollection = async (): Promise<Collection<InvoiceDocument>> => {
  const db = await getDatabase();
  const collection = db.collection<InvoiceDocument>('invoices');
  await collection.createIndex({ number: 1 }, { unique: true });
  return collection;
};

export const serializeInvoice = (doc: InvoiceDocument): InvoiceWithMeta => {
  const { _id, createdAt, updatedAt, ...rest } = doc;

  return {
    ...rest,
    _id: _id.toHexString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt ? updatedAt.toISOString() : undefined,
  };
};

export const isDuplicateKeyError = (error: unknown) => {
  return error instanceof MongoServerError && error.code === 11000;
};
