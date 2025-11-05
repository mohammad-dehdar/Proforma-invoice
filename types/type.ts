export type Service = {
  id: number;
  description: string;
  additionalDescription?: string;
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
  iban?: string; // ✅ فیلد شماره شبا اضافه شد
};

export type Invoice = {
  number: string;
  date: string;
  customer: Customer;
  services: Service[];
  paymentInfo: PaymentInfo;
  discount?: number;
  tax?: number;
  notes?: string;
};

export type InvoiceWithMeta = Invoice & {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
};

// تایپ‌های validation
export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

// تایپ‌های کارت بانکی
export type CompanyCard = {
  id: number;
  cardNumber: string;
  cardHolderName: string;
  bankName: string;
  iban: string; // ✅ فیلد شماره شبا اضافه شد
  isDefault: boolean;
};

// تایپ‌های نمایش
export type View = 'invoice' | 'dashboard' | 'history';