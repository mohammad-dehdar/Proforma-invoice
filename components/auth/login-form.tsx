'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';
import { useAuthStore } from '@/store/use-auth-store';

export const LoginForm = () => {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore((state) => ({
    login: state.login,
    loading: state.loading,
    error: state.error,
    clearError: state.clearError,
  }));

  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await login(credentials.username.trim(), credentials.password);
    if (success) {
      router.replace('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-5"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-blue-400">ورود به سیستم</h1>
          <p className="text-gray-400 text-sm">لطفاً نام کاربری و رمز عبور خود را وارد کنید</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label required>نام کاربری</Label>
            <Input
              value={credentials.username}
              onChange={(event) => {
                clearError();
                setCredentials((prev) => ({ ...prev, username: event.target.value }));
              }}
              placeholder="example"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label required>رمز عبور</Label>
            <Input
              type="password"
              value={credentials.password}
              onChange={(event) => {
                clearError();
                setCredentials((prev) => ({ ...prev, password: event.target.value }));
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 text-sm rounded-lg p-3 text-right">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading || !credentials.username || !credentials.password}
        >
          {loading ? 'در حال ورود...' : 'ورود'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
