import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { getInvoiceCollection, serializeInvoice } from '@/lib/invoices';
import { Invoice } from '@/types/type';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const collection = await getInvoiceCollection();
    const invoices = await collection
      .find({ userId: new ObjectId(session.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ invoices: invoices.map(serializeInvoice) });
  } catch (error) {
    console.error('Error loading invoices', error);
    return NextResponse.json({ message: 'خطا در بارگذاری فاکتورها' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let payload: Invoice;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'داده‌های ارسالی نامعتبر است.' }, { status: 400 });
  }

  if (!payload.number) {
    return NextResponse.json({ message: 'شماره فاکتور الزامی است.' }, { status: 400 });
  }

  try {
    const ownerId = new ObjectId(session.userId);
    const collection = await getInvoiceCollection();

    const existing = await collection.findOne({ userId: ownerId, number: payload.number });

    if (existing) {
      return NextResponse.json(
        {
          message: 'فاکتور با این شماره قبلاً ثبت شده است.',
          invoiceId: existing._id.toHexString(),
        },
        { status: 409 }
      );
    }

    const now = new Date();
    const document = {
      number: payload.number,
      date: payload.date,
      customer: payload.customer,
      services: payload.services,
      paymentInfo: payload.paymentInfo,
      discount: payload.discount ?? 0,
      tax: payload.tax ?? 0,
      notes: payload.notes ?? '',
      userId: ownerId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(document);
    const created = await collection.findOne({ _id: result.insertedId });

    if (!created) {
      return NextResponse.json({ message: 'خطا در ذخیره فاکتور' }, { status: 500 });
    }

    return NextResponse.json({ invoice: serializeInvoice(created) }, { status: 201 });
  } catch (error) {
    console.error('Error saving invoice', error);
    return NextResponse.json({ message: 'خطا در ذخیره فاکتور' }, { status: 500 });
  }
}
