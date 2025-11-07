const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_LENGTH = 4;
const LETTER_COUNT = 3;

export const generateRandomInvoiceNumber = (): string => {
  const randomLetters = Array.from({ length: LETTER_COUNT }, () =>
    LETTERS[Math.floor(Math.random() * LETTERS.length)]
  ).join('');

  const randomNumbers = Math.floor(Math.random() * 10 ** NUMBER_LENGTH)
    .toString()
    .padStart(NUMBER_LENGTH, '0');

  return `${randomLetters}-${randomNumbers}`;
};
