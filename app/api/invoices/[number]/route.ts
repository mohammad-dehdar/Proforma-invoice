import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/server';
import { getInvoicesCollection, serializeInvoice } from '@/lib/db/invoices';
import { Invoice } from '@/types/type';
import { validateInvoice } from '@/utils/validation';

const unauthorized = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function PUT(request: NextRequest, { params }: { params: { number: string } }) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return unauthorized;
  }

  const invoiceNumber = decodeURIComponent(params.number);

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
    const updateResult = await collection.findOneAndUpdate(
      { number: invoiceNumber },
      {
        $set: {
          ...invoice,
          updatedAt: new Date(),
          updatedBy: session.username,
        },
      },
      { returnDocument: 'after' }
    );

    if (!updateResult.value) {
      return NextResponse.json(
        { error: 'فاکتور مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice: serializeInvoice(updateResult.value) });
  } catch (error) {
    console.error('Failed to update invoice:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی فاکتور.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { number: string } }) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return unauthorized;
  }

  const invoiceNumber = decodeURIComponent(params.number);

  try {
    const collection = await getInvoicesCollection();
    const deleteResult = await collection.findOneAndDelete({ number: invoiceNumber });

    if (!deleteResult.value) {
      return NextResponse.json(
        { error: 'فاکتور مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    return NextResponse.json(
      { error: 'خطا در حذف فاکتور.' },
      { status: 500 }
    );
  }
}
