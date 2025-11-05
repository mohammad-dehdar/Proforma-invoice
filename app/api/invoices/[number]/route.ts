import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { deleteInvoice, getInvoiceByNumber, updateInvoice } from '@/lib/invoice-service';
import { Invoice } from '@/types/type';

type RouteContext = {
  params: {
    number: string;
  };
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const number = decodeURIComponent(context.params.number);
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: 'درخواست نامعتبر است.' }, { status: 400 });
  }

  const invoice = body.invoice as Invoice | undefined;
  if (!invoice) {
    return NextResponse.json({ message: 'اطلاعات فاکتور نامعتبر است.' }, { status: 400 });
  }

  const existing = await getInvoiceByNumber(number);
  if (!existing) {
    return NextResponse.json({ message: 'فاکتور مورد نظر یافت نشد.' }, { status: 404 });
  }

  const updated = await updateInvoice(number, invoice, session.username);

  return NextResponse.json({ invoice: updated });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const number = decodeURIComponent(context.params.number);
  const deleted = await deleteInvoice(number);

  if (!deleted) {
    return NextResponse.json({ message: 'فاکتور مورد نظر یافت نشد.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
