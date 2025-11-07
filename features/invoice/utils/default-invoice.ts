import { companyCards } from '@/constants/company-info';
import { Invoice } from '@/types/type';
import { detectBankFromCardNumber } from '@utils/detect-bank';

export const createDefaultInvoice = (): Invoice => {
  const defaultCard = companyCards.find((card) => card.isDefault) || companyCards[0];
  const detectedBank = detectBankFromCardNumber(defaultCard.cardNumber);
  const detectedBankName = detectedBank?.bank || defaultCard.bankName || '';
  const detectedBankLogo = detectedBank?.logo || defaultCard.bankLogo;

  return {
    _id: undefined,
    number: '',
    date: new Date().toLocaleDateString('fa-IR'),
    customer: {
      name: '',
      company: '',
      phone: '',
      address: '',
    },
    services: [],
    paymentInfo: {
      cardNumber: defaultCard.cardNumber,
      cardHolderName: defaultCard.cardHolderName,
      bankName: detectedBankName,
      bankLogo: detectedBankLogo,
      iban: defaultCard.iban,
    },
    discount: 0,
    tax: 9,
    notes: '',
  };
};
