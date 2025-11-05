import { WithId } from 'mongodb';
import { getDb } from './db';
import { Invoice, StoredInvoice } from '@/types/type';

const collectionName = 'invoices';

type DbInvoice = Omit<StoredInvoice, '_id' | 'createdAt' | 'updatedAt'> & {
  createdAt: Date;
  updatedAt: Date;
};

type DbInvoiceWithId = WithId<DbInvoice>;

const serializeInvoice = (invoice: DbInvoiceWithId): StoredInvoice => ({
  ...invoice,
  _id: invoice._id.toHexString(),
  createdAt: invoice.createdAt.toISOString(),
  updatedAt: invoice.updatedAt.toISOString(),
});

const calculateInvoiceTotal = (invoice: Invoice): number => {
  const subtotal = invoice.services.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0,
  );
  const discountAmount = invoice.discount ? subtotal * (invoice.discount / 100) : 0;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = invoice.tax ? afterDiscount * (invoice.tax / 100) : 0;
  return Math.round(afterDiscount + taxAmount);
};

export const getInvoices = async (limit?: number): Promise<StoredInvoice[]> => {
  const db = await getDb();
  const cursor = db
    .collection<DbInvoice>(collectionName)
    .find({}, { sort: { createdAt: -1 } });

  if (limit) {
    cursor.limit(limit);
  }

  const invoices = await cursor.toArray();
  return invoices.map((invoice) => serializeInvoice(invoice as DbInvoiceWithId));
};

export const getInvoiceByNumber = async (number: string): Promise<StoredInvoice | null> => {
  const db = await getDb();
  const invoice = await db
    .collection<DbInvoice>(collectionName)
    .findOne({ number });

  return invoice ? serializeInvoice(invoice as DbInvoiceWithId) : null;
};

export const createInvoice = async (
  invoice: Invoice,
  username: string,
): Promise<StoredInvoice> => {
  const db = await getDb();
  const now = new Date();

  const doc: DbInvoice = {
    ...invoice,
    createdBy: username,
    updatedBy: username,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<DbInvoice>(collectionName).insertOne(doc);

  return serializeInvoice({
    ...doc,
    _id: result.insertedId,
  });
};

export const updateInvoice = async (
  number: string,
  invoice: Invoice,
  username: string,
): Promise<StoredInvoice | null> => {
  const db = await getDb();
  const now = new Date();

  const result = await db
    .collection<DbInvoice>(collectionName)
    .findOneAndUpdate(
      { number },
      {
        $set: {
          ...invoice,
          updatedBy: username,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
          createdBy: username,
          updatedBy: username,
        },
      },
      { returnDocument: 'after', upsert: false },
    );

  if (!result.value) {
    return null;
  }

  return serializeInvoice(result.value as DbInvoiceWithId);
};

export const deleteInvoice = async (number: string): Promise<boolean> => {
  const db = await getDb();
  const result = await db.collection<DbInvoice>(collectionName).deleteOne({ number });
  return result.deletedCount === 1;
};

export const getDashboardStats = async () => {
  const invoices = await getInvoices();
  const now = new Date();

  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, invoice) => sum + calculateInvoiceTotal(invoice), 0);
  const customerKeys = invoices.map(
    (invoice) => invoice.customer.phone || invoice.customer.name || invoice.number,
  );
  const totalCustomers = new Set(customerKeys).size;
  const thisMonth = invoices.filter((invoice) => {
    const createdAt = new Date(invoice.createdAt);
    return (
      createdAt.getUTCFullYear() === now.getUTCFullYear() &&
      createdAt.getUTCMonth() === now.getUTCMonth()
    );
  }).length;

  return {
    totalInvoices,
    totalRevenue,
    totalCustomers,
    thisMonth,
    recentInvoices: invoices.slice(0, 5),
  };
};
