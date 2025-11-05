import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDb } from './db';
import type { NextRequest } from 'next/server';

const AUTH_SECRET = process.env.AUTH_SECRET;
const AUTH_TOKEN_COOKIE = 'etmify_session';
const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_KEYLEN = 32;
const PASSWORD_DIGEST = 'sha256';

type DbUser = {
  _id: ObjectId;
  username: string;
  passwordHash: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
};

type SessionPayload = {
  username: string;
};

export type SessionUser = {
  username: string;
};

if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is not configured');
}

const createPasswordHash = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const derived = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEYLEN, PASSWORD_DIGEST).toString('hex');
  return `pbkdf2:${PASSWORD_ITERATIONS}:${salt}:${derived}`;
};

const verifyPassword = (password: string, storedHash: string): boolean => {
  const parts = storedHash.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return false;
  }

  const [, iterationsStr, salt, hash] = parts;
  const iterations = Number(iterationsStr);
  if (!iterations || !salt || !hash) {
    return false;
  }

  const derived = pbkdf2Sync(password, salt, iterations, PASSWORD_KEYLEN, PASSWORD_DIGEST).toString('hex');

  const storedBuffer = Buffer.from(hash, 'hex');
  const derivedBuffer = Buffer.from(derived, 'hex');

  return storedBuffer.length === derivedBuffer.length && timingSafeEqual(storedBuffer, derivedBuffer);
};

const parseSeedUsers = (): Array<{ username: string; password: string }> => {
  const raw = process.env.AUTH_SEED_USERS;
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [username, password] = entry.split(':');
      return {
        username: username?.trim() || '',
        password: password?.trim() || '',
      };
    })
    .filter(({ username, password }) => username && password);
};

let seedingPromise: Promise<void> | null = null;

export const ensureSeedUsers = async (): Promise<void> => {
  if (!seedingPromise) {
    seedingPromise = (async () => {
      const entries = parseSeedUsers();
      if (!entries.length) {
        return;
      }

      const db = await getDb();
      const usersCollection = db.collection<DbUser>('users');
      const now = new Date();

      for (const entry of entries) {
        const existing = await usersCollection.findOne({ username: entry.username });
        if (!existing) {
          await usersCollection.insertOne({
            username: entry.username,
            passwordHash: createPasswordHash(entry.password),
            roles: ['admin'],
            createdAt: now,
            updatedAt: now,
          });
        } else if (!verifyPassword(entry.password, existing.passwordHash)) {
          await usersCollection.updateOne(
            { _id: existing._id },
            {
              $set: {
                passwordHash: createPasswordHash(entry.password),
                updatedAt: now,
              },
            },
          );
        }
      }
    })();
  }

  await seedingPromise;
};

export const findUserByUsername = async (username: string): Promise<DbUser | null> => {
  const db = await getDb();
  return db.collection<DbUser>('users').findOne({ username });
};

export const authenticateUser = async (username: string, password: string): Promise<SessionUser | null> => {
  await ensureSeedUsers();
  const user = await findUserByUsername(username);
  if (!user) {
    return null;
  }

  const valid = verifyPassword(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return { username: user.username };
};

export const createSessionToken = (payload: SessionPayload): string => {
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: '24h',
  });
};

export const verifySessionToken = (token: string): SessionUser | null => {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as SessionPayload;
    return { username: decoded.username };
  } catch {
    return null;
  }
};

export const getSessionFromRequest = (request: NextRequest): SessionUser | null => {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
};

export const buildSessionCookie = (token: string) => ({
  name: AUTH_TOKEN_COOKIE,
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24, // 1 day
});

export const clearSessionCookie = () => ({
  name: AUTH_TOKEN_COOKIE,
  value: '',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 0,
});
