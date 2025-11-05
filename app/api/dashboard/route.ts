import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/server';
import { getInvoicesCollection, serializeInvoice } from '@/lib/db/invoices';
import { calculateTotal } from '@/utils/formatter';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const collection = await getInvoicesCollection();
    const docs = await collection.find().sort({ createdAt: -1 }).toArray();

    const totalInvoices = docs.length;
    const totalRevenue = docs.reduce((sum, invoice) => {
      const subtotal = invoice.services.reduce(
        (acc, service) => acc + service.price * service.quantity,
        0
      );
      return sum + calculateTotal(subtotal, invoice.discount ?? 0, invoice.tax ?? 0);
    }, 0);

    const uniqueCustomers = new Set(
      docs.map((invoice) =>
        invoice.customer.name?.trim() ||
        invoice.customer.company?.trim() ||
        invoice.customer.phone?.trim() ||
        invoice.number
      )
    ).size;

    const now = new Date();
    const thisMonth = docs.filter((invoice) => {
      const createdAt = invoice.createdAt;
      return (
        createdAt.getUTCFullYear() === now.getUTCFullYear() &&
        createdAt.getUTCMonth() === now.getUTCMonth()
      );
    }).length;

    const recentInvoices = docs.slice(0, 5).map(serializeInvoice);

    return NextResponse.json({
      stats: {
        totalInvoices,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        thisMonth,
      },
      recentInvoices,
    });
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات داشبورد.' },
      { status: 500 }
    );
  }
}
