import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AUTH_COOKIE_NAME, createSessionToken, ensureDefaultUser, getUserByCredentials, verifyPassword } from '@/lib/auth';

const loginSchema = z.object({
  username: z.string().min(1, 'نام کاربری الزامی است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join('، ');
      return NextResponse.json({ message }, { status: 400 });
    }

    await ensureDefaultUser();

    const user = await getUserByCredentials(parsed.data.username);

    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return NextResponse.json({ message: 'نام کاربری یا رمز عبور اشتباه است' }, { status: 401 });
    }

    const token = createSessionToken({ userId: user._id.toString(), username: user.username });

    const response = NextResponse.json({
      user: { id: user._id.toString(), username: user.username },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ message: 'خطای داخلی سرور' }, { status: 500 });
  }
}
