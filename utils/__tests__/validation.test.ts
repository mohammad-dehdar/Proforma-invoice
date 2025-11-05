import { describe, expect, it } from 'vitest';

import {
  isValidIranianCard,
  isValidIranianIBAN,
  isValidIranianPhone
} from '../validation';

describe('isValidIranianCard', () => {
  it('returns true for a valid Iranian card number with spaces', () => {
    expect(isValidIranianCard('6037 9972 1100 8801')).toBe(true);
  });

  it('returns false when the card number is not 16 digits long', () => {
    expect(isValidIranianCard('603799721100880')).toBe(false);
  });

  it('returns false when the card number fails the Luhn checksum', () => {
    expect(isValidIranianCard('6037997211008802')).toBe(false);
  });
});

describe('isValidIranianIBAN', () => {
  it('returns true for a valid Iranian IBAN', () => {
    expect(isValidIranianIBAN('IR062960000000100324200001')).toBe(true);
  });

  it('returns false for IBANs that do not match the Iranian format', () => {
    expect(isValidIranianIBAN('IR06296000000010032420000')).toBe(false);
    expect(isValidIranianIBAN('DE12500105170648489890')).toBe(false);
  });

  it('returns false when the IBAN checksum is incorrect', () => {
    expect(isValidIranianIBAN('IR062960000000100324200002')).toBe(false);
  });
});

describe('isValidIranianPhone', () => {
  it('returns true for a valid Iranian mobile number', () => {
    expect(isValidIranianPhone('09123456789')).toBe(true);
  });

  it('returns false for numbers that are not 11 digits long', () => {
    expect(isValidIranianPhone('0912345678')).toBe(false);
  });

  it('returns false for numbers that do not start with 09', () => {
    expect(isValidIranianPhone('08123456789')).toBe(false);
  });
});
