import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { serializeInvoice, InvoiceDocument } from '@/lib/invoice-utils';

const serviceSchema = z.object({
  id: z.coerce.number(),
  description: z.string().min(1),
  additionalDescription: z.string().optional(),
  quantity: z.coerce.number().positive(),
  price: z.coerce.number().nonnegative(),
});

const invoiceSchema = z.object({
  number: z.string().min(3),
  date: z.string().min(1),
  customer: z.object({
    name: z.string().min(1),
    company: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  services: z.array(serviceSchema).min(1),
  paymentInfo: z.object({
    cardNumber: z.string().min(1),
    cardHolderName: z.string().min(1),
    bankName: z.string().optional(),
    bankLogo: z.string().optional(),
    iban: z.string().optional(),
  }),
  discount: z.coerce.number().min(0).max(100).optional(),
  tax: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: 'نیاز به ورود مجدد دارید' }, { status: 401 });
  }

  const db = await getDb();
  const invoices = (await db
    .collection('invoices')
    .find({ userId: new ObjectId(user.id) })
    .sort({ createdAt: -1 })
    .toArray()) as InvoiceDocument[];

  return NextResponse.json({ invoices: invoices.map((invoice) => serializeInvoice(invoice)) });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: 'نیاز به ورود مجدد دارید' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = invoiceSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join('، ');
      return NextResponse.json({ message }, { status: 400 });
    }

    const db = await getDb();
    const invoicesCollection = db.collection('invoices');

    const existing = await invoicesCollection.findOne({
      userId: new ObjectId(user.id),
      number: parsed.data.number,
    });

    if (existing) {
      return NextResponse.json(
        {
          message: 'فاکتوری با این شماره قبلاً ثبت شده است',
          invoiceId: existing._id.toString(),
        },
        { status: 409 },
      );
    }

    const now = new Date();
    const result = await invoicesCollection.insertOne({
      ...parsed.data,
      userId: new ObjectId(user.id),
      createdAt: now,
      updatedAt: now,
    });

    const savedInvoice = (await invoicesCollection.findOne({ _id: result.insertedId })) as InvoiceDocument | null;

    return NextResponse.json(
      {
        invoice: savedInvoice ? serializeInvoice(savedInvoice) : null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create invoice error', error);
    return NextResponse.json({ message: 'خطای داخلی سرور' }, { status: 500 });
  }
}
