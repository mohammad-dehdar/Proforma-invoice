import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { createInvoice, getInvoiceByNumber, getInvoices } from '@/lib/invoice-service';
import { Invoice } from '@/types/type';

const parseLimit = (value: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
};

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const limit = parseLimit(request.nextUrl.searchParams.get('limit'));
  const invoices = await getInvoices(limit);

  return NextResponse.json({ invoices });
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: 'درخواست نامعتبر است.' }, { status: 400 });
  }

  const invoice = body.invoice as Invoice | undefined;
  if (!invoice || !invoice.number) {
    return NextResponse.json({ message: 'اطلاعات فاکتور نامعتبر است.' }, { status: 400 });
  }

  const existing = await getInvoiceByNumber(invoice.number);
  if (existing) {
    return NextResponse.json(
      { message: 'فاکتور با این شماره از قبل ثبت شده است.', invoice: existing },
      { status: 409 },
    );
  }

  const created = await createInvoice(invoice, session.username);

  return NextResponse.json({ invoice: created }, { status: 201 });
}
