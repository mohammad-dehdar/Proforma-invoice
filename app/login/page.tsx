import { LoginForm } from '@/components/auth/login-form';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  const session = getServerSession();

  if (session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-400">ورود به سیستم پیش‌فاکتور</h1>
          <p className="text-gray-400 text-sm">
            لطفاً نام کاربری و رمز عبور خود را وارد کنید.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
