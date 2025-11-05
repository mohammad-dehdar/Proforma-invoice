import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/server';
import { getInvoicesCollection, isDuplicateKeyError, serializeInvoice } from '@/lib/db/invoices';
import { Invoice } from '@/types/type';
import { validateInvoice } from '@/utils/validation';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const collection = await getInvoicesCollection();
    const docs = await collection.find().sort({ createdAt: -1 }).toArray();
    const invoices = docs.map(serializeInvoice);

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Failed to load invoices:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فاکتورها.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invoice = (await request.json()) as Invoice;
    const validation = validateInvoice(invoice);

    if (!validation.isValid) {
      return NextResponse.json(
        { errors: validation.errors },
        { status: 422 }
      );
    }

    const collection = await getInvoicesCollection();
    const now = new Date();
    const doc = {
      ...invoice,
      createdAt: now,
      updatedAt: now,
      createdBy: session.username,
      updatedBy: session.username,
    };

    const result = await collection.insertOne(doc);
    const inserted = await collection.findOne({ _id: result.insertedId });

    if (!inserted) {
      throw new Error('Invoice insert failed');
    }

    return NextResponse.json({ invoice: serializeInvoice(inserted) }, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'شماره فاکتور تکراری است.' },
        { status: 409 }
      );
    }

    console.error('Failed to create invoice:', error);
    return NextResponse.json(
      { error: 'خطا در ذخیره فاکتور.' },
      { status: 500 }
    );
  }
}
