import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export const hashPassword = (password: string): string => {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derivedKey}`;
};

export const verifyPassword = (password: string, hash: string): boolean => {
  const [salt, key] = hash.split(':');
  if (!salt || !key) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedBuffer = Buffer.from(derivedKey, 'hex');

  if (keyBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(keyBuffer, derivedBuffer);
};
