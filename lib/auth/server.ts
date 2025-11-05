import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, SessionData, verifySessionToken } from '@/lib/auth/session';

export const getSessionFromRequest = (request: NextRequest): SessionData | null => {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
};

export const getSessionFromCookies = (): SessionData | null => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
};
