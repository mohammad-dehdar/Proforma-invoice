import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { getInvoiceCollection, serializeInvoice } from '@/lib/invoices';
import { calculateTotal } from '@/utils/formatter';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ownerId = new ObjectId(session.userId);
    const collection = await getInvoiceCollection();
    const invoices = await collection
      .find({ userId: ownerId })
      .sort({ createdAt: -1 })
      .toArray();

    const totalRevenue = invoices.reduce((sum, invoice) => {
      const subtotal = invoice.services.reduce(
        (serviceTotal, service) => serviceTotal + service.price * service.quantity,
        0
      );
      return sum + calculateTotal(subtotal, invoice.discount ?? 0, invoice.tax ?? 0);
    }, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonth = invoices.filter(
      (invoice) => invoice.createdAt && invoice.createdAt >= startOfMonth
    ).length;

    const customers = new Set(
      invoices
        .map((invoice) => invoice.customer?.name?.trim())
        .filter((name): name is string => Boolean(name && name.length > 0))
    );

    return NextResponse.json({
      stats: {
        totalInvoices: invoices.length,
        totalRevenue,
        totalCustomers: customers.size,
        thisMonth,
      },
      recentInvoices: invoices.slice(0, 5).map(serializeInvoice),
    });
  } catch (error) {
    console.error('Error loading dashboard data', error);
    return NextResponse.json({ message: 'خطا در بارگذاری داشبورد' }, { status: 500 });
  }
}
