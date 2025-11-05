import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

export type SessionData = {
  username: string;
  exp: number;
};

const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable is not set.`);
  }
  return value;
};

const hashValue = (value: string) => createHash('sha256').update(value).digest();

const timingSafeCompare = (a: string, b: string) => {
  const hashA = hashValue(a);
  const hashB = hashValue(b);
  return timingSafeEqual(hashA, hashB);
};

const base64UrlEncode = (value: Buffer) => value.toString('base64url');

const base64UrlDecode = (value: string) => Buffer.from(value, 'base64url');

export const SESSION_COOKIE_NAME = 'etmify_session';

const DEFAULT_SESSION_TTL_HOURS = 8;

const getSessionTtlMs = () => {
  const ttlEnv = process.env.AUTH_SESSION_TTL_HOURS;
  const ttlHours = ttlEnv ? Number(ttlEnv) : DEFAULT_SESSION_TTL_HOURS;
  const normalized = Number.isFinite(ttlHours) && ttlHours > 0 ? ttlHours : DEFAULT_SESSION_TTL_HOURS;
  return normalized * 60 * 60 * 1000;
};

export const SESSION_MAX_AGE_SECONDS = Math.floor(getSessionTtlMs() / 1000);

type SessionTokenPayload = SessionData & {
  nonce: string;
};

export const createSessionToken = (username: string): string => {
  const secret = getRequiredEnv('AUTH_SECRET');
  const payload: SessionTokenPayload = {
    username,
    exp: Date.now() + getSessionTtlMs(),
    nonce: randomBytes(16).toString('hex'),
  };

  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const signature = createHmac('sha256', secret).update(encodedPayload).digest();
  const encodedSignature = base64UrlEncode(signature);

  return `${encodedPayload}.${encodedSignature}`;
};

export const verifySessionToken = (token?: string | null): SessionData | null => {
  if (!token) {
    return null;
  }

  const secret = getRequiredEnv('AUTH_SECRET');
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, encodedSignature] = parts;
  const expectedSignature = createHmac('sha256', secret).update(encodedPayload).digest();

  try {
    const providedSignature = base64UrlDecode(encodedSignature);
    if (expectedSignature.length !== providedSignature.length ||
      !timingSafeEqual(expectedSignature, providedSignature)) {
      return null;
    }

    const payloadBuffer = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadBuffer.toString('utf8')) as SessionTokenPayload;

    if (!payload.username || typeof payload.exp !== 'number') {
      return null;
    }

    if (payload.exp < Date.now()) {
      return null;
    }

    return { username: payload.username, exp: payload.exp };
  } catch {
    return null;
  }
};

export const validateCredentials = (username: string, password: string): boolean => {
  const expectedUsername = getRequiredEnv('AUTH_USERNAME');
  const expectedPassword = getRequiredEnv('AUTH_PASSWORD');

  try {
    const usernameMatches = timingSafeCompare(username, expectedUsername);
    const passwordMatches = timingSafeCompare(password, expectedPassword);
    return usernameMatches && passwordMatches;
  } catch {
    return false;
  }
};
