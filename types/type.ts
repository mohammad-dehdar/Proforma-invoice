export type Service = {
  id: number;
  description: string;
  quantity: number;
  price: number;
};

export type Customer = {
  name: string;
  company?: string;
  phone?: string;
  address?: string;
};

export type PaymentInfo = {
  cardNumber: string;
  cardHolderName: string;
  bankName?: string;
};

export type Invoice = {
  number: string;
  date: string;
  customer: Customer;
  services: Service[];
  paymentInfo: PaymentInfo;
  discount?: number; // ✅ جدید
  tax?: number; // ✅ جدید
  notes?: string; // ✅ جدید
};
