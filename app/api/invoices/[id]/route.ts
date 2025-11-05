import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { serializeInvoice } from '@/lib/invoice-utils';

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
    iban: z.string().optional(),
  }),
  discount: z.coerce.number().min(0).max(100).optional(),
  tax: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: 'نیاز به ورود مجدد دارید' }, { status: 401 });
  }

  const invoiceId = params.id;

  if (!ObjectId.isValid(invoiceId)) {
    return NextResponse.json({ message: 'شناسه فاکتور معتبر نیست' }, { status: 400 });
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
    const invoiceObjectId = new ObjectId(invoiceId);

    const currentInvoice = await invoicesCollection.findOne({
      _id: invoiceObjectId,
      userId: new ObjectId(user.id),
    });

    if (!currentInvoice) {
      return NextResponse.json({ message: 'فاکتور پیدا نشد' }, { status: 404 });
    }

    if (currentInvoice.number !== parsed.data.number) {
      const conflict = await invoicesCollection.findOne({
        userId: new ObjectId(user.id),
        number: parsed.data.number,
        _id: { $ne: invoiceObjectId },
      });

      if (conflict) {
        return NextResponse.json(
          { message: 'شماره فاکتور تکراری است' },
          { status: 409 },
        );
      }
    }

    await invoicesCollection.updateOne(
      { _id: invoiceObjectId },
      {
        $set: {
          ...parsed.data,
          updatedAt: new Date(),
        },
      },
    );

    const updatedInvoice = await invoicesCollection.findOne({ _id: invoiceObjectId });

    return NextResponse.json({ invoice: updatedInvoice ? serializeInvoice(updatedInvoice) : null });
  } catch (error) {
    console.error('Update invoice error', error);
    return NextResponse.json({ message: 'خطای داخلی سرور' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: 'نیاز به ورود مجدد دارید' }, { status: 401 });
  }

  const invoiceId = params.id;

  if (!ObjectId.isValid(invoiceId)) {
    return NextResponse.json({ message: 'شناسه فاکتور معتبر نیست' }, { status: 400 });
  }

  const db = await getDb();
  const invoicesCollection = db.collection('invoices');

  const result = await invoicesCollection.deleteOne({
    _id: new ObjectId(invoiceId),
    userId: new ObjectId(user.id),
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ message: 'فاکتور یافت نشد' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: 'نیاز به ورود مجدد دارید' }, { status: 401 });
  }

  const invoiceId = params.id;

  if (!ObjectId.isValid(invoiceId)) {
    return NextResponse.json({ message: 'شناسه فاکتور معتبر نیست' }, { status: 400 });
  }

  const db = await getDb();
  const invoice = await db
    .collection('invoices')
    .findOne({ _id: new ObjectId(invoiceId), userId: new ObjectId(user.id) });

  if (!invoice) {
    return NextResponse.json({ message: 'فاکتور پیدا نشد' }, { status: 404 });
  }

  return NextResponse.json({ invoice: serializeInvoice(invoice) });
}
