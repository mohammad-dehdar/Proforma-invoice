import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from './db';

export const AUTH_COOKIE_NAME = 'etmify_auth';

const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

const TOKEN_HEADER = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

export interface AuthTokenPayload {
  userId: string;
  username: string;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
}

const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_LENGTH = 64;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('متغیر محیطی JWT_SECRET تنظیم نشده است.');
  }
  return secret;
}

function base64UrlEncode(content: string | Buffer): string {
  return Buffer.from(content)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(content: string): Buffer {
  const normalized = content.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = padding ? normalized + '='.repeat(4 - padding) : normalized;
  return Buffer.from(padded, 'base64');
}

export function hashPassword(password: string): string {
  const salt = randomBytes(PASSWORD_SALT_BYTES);
  const derivedKey = scryptSync(password, salt, PASSWORD_KEY_LENGTH);
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, keyHex] = stored.split(':');
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const derivedKey = scryptSync(password, salt, PASSWORD_KEY_LENGTH);
  const originalKey = Buffer.from(keyHex, 'hex');
  return timingSafeEqual(derivedKey, originalKey);
}

export function createSessionToken(payload: Omit<AuthTokenPayload, 'exp'>, expiresInSeconds = TOKEN_EXPIRATION_SECONDS): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body: AuthTokenPayload = { ...payload, exp };
  const payloadSegment = base64UrlEncode(JSON.stringify(body));
  const data = `${TOKEN_HEADER}.${payloadSegment}`;
  const signature = createHmac('sha256', getJwtSecret()).update(data).digest();
  return `${data}.${base64UrlEncode(signature)}`;
}

export function verifySessionToken(token: string): AuthTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts;
  if (headerPart !== TOKEN_HEADER) return null;

  const data = `${headerPart}.${payloadPart}`;
  const expectedSignature = createHmac('sha256', getJwtSecret()).update(data).digest();
  const providedSignature = base64UrlDecode(signaturePart);

  if (expectedSignature.length !== providedSignature.length || !timingSafeEqual(expectedSignature, providedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart).toString('utf-8')) as AuthTokenPayload;
    if (!payload.exp || typeof payload.exp !== 'number') {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function ensureDefaultUser(): Promise<void> {
  try {
    const username = process.env.AUTH_DEFAULT_USERNAME;
    const password = process.env.AUTH_DEFAULT_PASSWORD;

    if (!username || !password) {
      return;
    }

    const db = await getDb();
    const users = db.collection('users');
    const existing = await users.findOne({ username });

    if (!existing) {
      await users.insertOne({
        username,
        passwordHash: hashPassword(password),
        createdAt: new Date(),
      });
    }
  } catch (error) {
    // Silently fail during build time or if database is not available
    // This function will be called again at runtime when the route is actually invoked
    console.warn('Failed to ensure default user:', error);
  }
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  return { id: payload.userId, username: payload.username };
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const session = await authenticateRequest(request);
  if (!session) return null;

  const db = await getDb();
  const users = db.collection<{ _id: ObjectId; username: string }>('users');
  const user = await users.findOne({ _id: new ObjectId(session.id) });
  if (!user) {
    return null;
  }

  return { id: user._id.toString(), username: user.username };
}

export async function getUserByCredentials(username: string): Promise<{ _id: ObjectId; username: string; passwordHash: string } | null> {
  const db = await getDb();
  const users = db.collection<{ _id: ObjectId; username: string; passwordHash: string }>('users');
  return users.findOne({ username });
}
