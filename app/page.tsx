import EtmifyInvoiceForm from '@/components/etmify-invoice-form';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token || !verifySessionToken(token)) {
    redirect('/login');
  }

  return <EtmifyInvoiceForm />;
}
