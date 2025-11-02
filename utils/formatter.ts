// فرمت کردن قیمت با جداکننده هزارگان
export const formatPrice = (value: number | string): string => {
  if (value === null || value === undefined || value === '') return '0';
  
  const num = typeof value === 'string' 
    ? value.replace(/,/g, '') 
    : value.toString();
  
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '0';
  
  return parsed.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// پارس کردن قیمت از رشته فرمت شده
export const parsePrice = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  const cleaned = value.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const parsed = parseInt(cleaned, 10);
  
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
};

// فرمت اعداد با سیستم فارسی
export const formatNumber = (num: number | string): string => {
  if (num === null || num === undefined) return '0';
  
  const parsed = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(parsed)) return '0';
  
  return new Intl.NumberFormat('fa-IR').format(parsed);
};

// فرمت شماره کارت
export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/.{1,4}/g);
  return match ? match.join('-') : cleaned;
};

// ✅ فرمت شماره شبا
export const formatIBAN = (value: string): string => {
  // حذف فاصله‌ها و تبدیل به حروف بزرگ
  const cleaned = value.replace(/\s/g, '').toUpperCase();
  
  // اضافه کردن فاصله بعد از هر 4 کاراکتر
  const match = cleaned.match(/.{1,4}/g);
  return match ? match.join(' ') : cleaned;
};

// ✅ پارس کردن شماره شبا (حذف فاصله‌ها)
export const parseIBAN = (value: string): string => {
  return value.replace(/\s/g, '').toUpperCase();
};

// اعتبارسنجی شماره کارت (الگوریتم ساده)
export const isValidCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  return cleaned.length === 16;
};

// فرمت تاریخ شمسی
export const formatDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('fa-IR');
};

// فرمت شماره تلفن ایران
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('09')) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// اعتبارسنجی شماره تلفن
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return /^09\d{9}$/.test(cleaned);
};

// محاسبه مجموع خدمات
export const calculateSubtotal = (services: Array<{quantity: number; price: number}>): number => {
  return services.reduce((total, service) => {
    return total + (service.quantity * service.price);
  }, 0);
};

// محاسبه تخفیف
export const calculateDiscount = (subtotal: number, discountPercent: number): number => {
  if (!discountPercent || discountPercent < 0 || discountPercent > 100) return 0;
  return subtotal * (discountPercent / 100);
};

// محاسبه مالیات
export const calculateTax = (amount: number, taxPercent: number): number => {
  if (!taxPercent || taxPercent < 0) return 0;
  return amount * (taxPercent / 100);
};

// محاسبه مجموع نهایی
export const calculateTotal = (
  subtotal: number,
  discountPercent: number = 0,
  taxPercent: number = 0
): number => {
  const discount = calculateDiscount(subtotal, discountPercent);
  const afterDiscount = subtotal - discount;
  const tax = calculateTax(afterDiscount, taxPercent);
  return afterDiscount + tax;
};