import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { calculateInvoiceTotal, serializeInvoice, InvoiceDocument } from '@/lib/invoice-utils';

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

  const uniqueCustomers = new Set(
    invoices
      .map((invoice) => invoice.customer?.name?.trim())
      .filter((name): name is string => Boolean(name)),
  ).size;

  const totalRevenue = invoices.reduce((sum, invoice) => sum + calculateInvoiceTotal(invoice), 0);

  const now = new Date();
  const thisMonthCount = invoices.filter((invoice) => {
    const createdAt = invoice.createdAt instanceof Date ? invoice.createdAt : new Date(invoice.createdAt);
    return (
      createdAt.getUTCFullYear() === now.getUTCFullYear() &&
      createdAt.getUTCMonth() === now.getUTCMonth()
    );
  }).length;

  return NextResponse.json({
    stats: {
      totalInvoices: invoices.length,
      totalRevenue,
      totalCustomers: uniqueCustomers,
      thisMonth: thisMonthCount,
    },
    recentInvoices: invoices.slice(0, 5).map((invoice) => serializeInvoice(invoice)),
  });
}
