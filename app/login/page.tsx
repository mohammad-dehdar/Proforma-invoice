import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export default function LoginPage() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;

  if (token && verifySessionToken(token)) {
    redirect('/');
  }

  return <LoginForm />;
}
