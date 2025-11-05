'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';

const initialError = '';

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = searchParams?.get('redirect') || '/';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(initialError);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 401) {
        const data = await response.json();
        setError(data.error || 'نام کاربری یا رمز عبور نادرست است.');
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'خطا در ورود. لطفاً دوباره تلاش کنید.');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته رخ داد.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="bg-gray-800/80 backdrop-blur rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400 mb-2">ورود به سیستم</h1>
          <p className="text-gray-400 text-sm">برای دسترسی به داشبورد و مدیریت فاکتورها وارد شوید</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label required>نام کاربری</Label>
            <div className="relative">
              <Input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="نام کاربری"
                disabled={isSubmitting}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <Label required>رمز عبور</Label>
            <div className="relative">
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                disabled={isSubmitting}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-300 text-sm rounded-lg p-3 text-right">
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            disabled={isSubmitting || !username || !password}
          >
            {isSubmitting ? 'در حال ورود...' : 'ورود'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
