'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';

export const LoginForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'اطلاعات ورود صحیح نیست.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Login failed', err);
      setError('ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label required isRTL>
          نام کاربری
        </Label>
        <Input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="username"
          disabled={isSubmitting}
          isRTL={false}
        />
      </div>

      <div>
        <Label required isRTL>
          رمز عبور
        </Label>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          disabled={isSubmitting}
          isRTL={false}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm text-right">{error}</p>
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
  );
};
