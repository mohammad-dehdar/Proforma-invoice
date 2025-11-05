import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getDashboardStats } from '@/lib/invoice-service';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const stats = await getDashboardStats();
  return NextResponse.json({ stats });
}
