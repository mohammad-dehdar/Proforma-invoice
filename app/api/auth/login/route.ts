import { getDatabase } from '@/lib/mongodb';
import { attachSessionCookie } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { message: 'نام کاربری و رمز عبور الزامی است.' },
      { status: 400 }
    );
  }

  const db = await getDatabase();
  const user = await db.collection('users').findOne<{ _id: unknown; username: string; password: string }>({ username });

  if (!user) {
    return NextResponse.json({ message: 'اطلاعات ورود اشتباه است.' }, { status: 401 });
  }

  const isValid = verifyPassword(password, user.password);

  if (!isValid) {
    return NextResponse.json({ message: 'اطلاعات ورود اشتباه است.' }, { status: 401 });
  }

  const response = NextResponse.json({ username: user.username });
  return attachSessionCookie(response, {
    userId: String(user._id),
    username: user.username,
  });
}
