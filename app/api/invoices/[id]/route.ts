import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { getInvoiceCollection, serializeInvoice } from '@/lib/invoices';
import { Invoice } from '@/types/type';

type RouteParams = {
  params: {
    id: string;
  };
};

const buildOwnerFilter = (id: string, ownerId: string) => ({
  _id: new ObjectId(id),
  userId: new ObjectId(ownerId),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'شناسه نامعتبر است.' }, { status: 400 });
  }

  try {
    const collection = await getInvoiceCollection();
    const invoice = await collection.findOne(buildOwnerFilter(params.id, session.userId));

    if (!invoice) {
      return NextResponse.json({ message: 'فاکتور یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json({ invoice: serializeInvoice(invoice) });
  } catch (error) {
    console.error('Error fetching invoice', error);
    return NextResponse.json({ message: 'خطا در خواندن فاکتور' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'شناسه نامعتبر است.' }, { status: 400 });
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
    const invoiceId = new ObjectId(params.id);
    const collection = await getInvoiceCollection();

    const existing = await collection.findOne({ _id: invoiceId, userId: ownerId });

    if (!existing) {
      return NextResponse.json({ message: 'فاکتور یافت نشد.' }, { status: 404 });
    }

    if (payload.number !== existing.number) {
      const duplicate = await collection.findOne({
        userId: ownerId,
        number: payload.number,
        _id: { $ne: invoiceId },
      });

      if (duplicate) {
        return NextResponse.json(
          { message: 'فاکتور دیگری با این شماره وجود دارد.' },
          { status: 409 }
        );
      }
    }

    const update = await collection.findOneAndUpdate(
      { _id: invoiceId, userId: ownerId },
      {
        $set: {
          number: payload.number,
          date: payload.date,
          customer: payload.customer,
          services: payload.services,
          paymentInfo: payload.paymentInfo,
          discount: payload.discount ?? 0,
          tax: payload.tax ?? 0,
          notes: payload.notes ?? '',
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!update.value) {
      return NextResponse.json({ message: 'خطا در بروزرسانی فاکتور' }, { status: 500 });
    }

    return NextResponse.json({ invoice: serializeInvoice(update.value) });
  } catch (error) {
    console.error('Error updating invoice', error);
    return NextResponse.json({ message: 'خطا در بروزرسانی فاکتور' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'شناسه نامعتبر است.' }, { status: 400 });
  }

  try {
    const ownerId = new ObjectId(session.userId);
    const invoiceId = new ObjectId(params.id);
    const collection = await getInvoiceCollection();

    const result = await collection.deleteOne({ _id: invoiceId, userId: ownerId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'فاکتور یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice', error);
    return NextResponse.json({ message: 'خطا در حذف فاکتور' }, { status: 500 });
  }
}
