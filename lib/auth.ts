import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export type SessionPayload = {
  userId: string;
  username: string;
};

const SESSION_COOKIE = 'etmify_session';
const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

type EncodedSession = SessionPayload & { exp: number };

const encode = (payload: EncodedSession) =>
  Buffer.from(JSON.stringify(payload)).toString('base64url');

const decode = (token: string): EncodedSession | null => {
  try {
    const json = Buffer.from(token, 'base64url').toString('utf8');
    return JSON.parse(json) as EncodedSession;
  } catch {
    return null;
  }
};

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined. Please set it in your environment variables.');
  }
  return secret;
};

const signToken = (payload: SessionPayload): string => {
  const data = encode({ ...payload, exp: Math.floor(Date.now() / 1000) + WEEK_IN_SECONDS });
  const signature = createHmac('sha256', getSecret())
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
};

export const verifySessionToken = (token?: string): SessionPayload | null => {
  if (!token) return null;

  const [data, signature] = token.split('.');
  if (!data || !signature) {
    return null;
  }

  const expectedSignature = createHmac('sha256', getSecret())
    .update(data)
    .digest();
  const providedSignature = Buffer.from(signature, 'base64url');

  if (expectedSignature.length !== providedSignature.length) {
    return null;
  }

  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    return null;
  }

  const payload = decode(data);
  if (!payload) {
    return null;
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    userId: payload.userId,
    username: payload.username,
  };
};

export const getSessionFromRequest = (req: NextRequest): SessionPayload | null => {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
};

export const getServerSession = (): SessionPayload | null => {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
};

export const attachSessionCookie = (response: NextResponse, payload: SessionPayload) => {
  const token = signToken(payload);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: WEEK_IN_SECONDS,
  });
  return response;
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
};
