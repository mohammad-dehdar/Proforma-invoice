import { detectBankFromCardNumber } from '@utils/detect-bank';
import { CompanyCard, PaymentInfo } from '@/types/type';

export const resolvePaymentInfoFromCard = (card: CompanyCard): PaymentInfo => {
  const detectedBank = detectBankFromCardNumber(card.cardNumber);

  return {
    cardNumber: card.cardNumber,
    cardHolderName: card.cardHolderName,
    bankName: detectedBank?.bank ?? card.bankName ?? '',
    bankLogo: detectedBank?.logo ?? card.bankLogo,
    iban: card.iban,
  };
};
