'use client';

import { FormEvent, useState } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { useAuthStore } from '@/store/use-auth-store';

export const LoginForm = () => {
  const { setUser, error, setError } = useAuthStore((state) => ({
    setUser: state.setUser,
    error: state.error,
    setError: state.setError,
  }));
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!credentials.username || !credentials.password) {
      setError('لطفاً نام کاربری و رمز عبور را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'خطای ناشناخته رخ داده است.' }));
        throw new Error(data.message || 'ورود ناموفق بود.');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ورود ناموفق بود.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-6 space-y-5"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-blue-400">ورود به سیستم پیش‌فاکتور</h1>
          <p className="text-sm text-gray-400">لطفاً نام کاربری و رمز عبور اختصاصی خود را وارد کنید.</p>
        </div>

        <div className="space-y-2 text-right">
          <Label htmlFor="username">نام کاربری</Label>
          <Input
            id="username"
            value={credentials.username}
            onChange={(event) =>
              setCredentials((prev) => ({ ...prev, username: event.target.value }))
            }
            placeholder="نام کاربری"
            autoComplete="username"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2 text-right">
          <Label htmlFor="password">رمز عبور</Label>
          <Input
            id="password"
            type="password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="رمز عبور"
            autoComplete="current-password"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 rounded-lg p-3 text-sm text-right">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'در حال ورود...' : 'ورود'}
        </Button>
      </form>
    </div>
  );
};
