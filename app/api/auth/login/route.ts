import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, buildSessionCookie, createSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json().catch(() => ({ username: '', password: '' }));

  if (!username || !password) {
    return NextResponse.json({ message: 'نام کاربری و رمز عبور الزامی است.' }, { status: 400 });
  }

  const user = await authenticateUser(username, password);

  if (!user) {
    return NextResponse.json({ message: 'اطلاعات ورود نامعتبر است.' }, { status: 401 });
  }

  const token = createSessionToken({ username: user.username });
  const response = NextResponse.json({ user });
  response.cookies.set(buildSessionCookie(token));

  return response;
}
