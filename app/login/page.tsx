import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from '@/features/auth/login-form';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export default async function LoginPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (token && verifySessionToken(token)) {
    redirect('/');
  }

  return <LoginForm />;
}
