import { ObjectId } from 'mongodb';

export interface InvoiceServiceDocument {
  id: number;
  description: string;
  additionalDescription?: string;
  quantity: number;
  price: number;
}

export interface InvoiceDocument {
  _id: ObjectId;
  userId: ObjectId;
  number: string;
  date: string;
  customer: {
    name: string;
    company?: string;
    phone?: string;
    address?: string;
  };
  services: InvoiceServiceDocument[];
  paymentInfo: {
    cardNumber: string;
    cardHolderName: string;
    bankName?: string;
    bankLogo?: string;
    iban?: string;
  };
  discount?: number;
  tax?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function calculateInvoiceTotal(invoice: Pick<InvoiceDocument, 'services' | 'discount' | 'tax'>): number {
  const subtotal = invoice.services.reduce((sum, service) => sum + service.price * service.quantity, 0);
  const discountAmount = subtotal * ((invoice.discount ?? 0) / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * ((invoice.tax ?? 0) / 100);
  return afterDiscount + taxAmount;
}

export function serializeInvoice(invoice: InvoiceDocument) {
  return {
    ...invoice,
    _id: invoice._id.toString(),
    userId: invoice.userId.toString(),
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  };
}
