import { Invoice, ValidationResult, ValidationError } from '@/types/type';

// اعتبارسنجی ایمیل
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// اعتبارسنجی شماره کارت ایرانی
export const isValidIranianCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length !== 16) return false;
  
  // الگوریتم Luhn
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// اعتبارسنجی شماره شبا ایرانی
export const isValidIranianIBAN = (iban: string): boolean => {
  // حذف فاصله‌ها و تبدیل به حروف بزرگ
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  
  // بررسی فرمت اولیه (IR + 24 رقم)
  if (!/^IR\d{24}$/.test(cleaned)) {
    return false;
  }
  
  // الگوریتم IBAN checksum
  // جابجایی 4 کاراکتر اول به انتها
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  
  // تبدیل حروف به اعداد (A=10, B=11, ..., Z=35)
  const numeric = rearranged
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 ? code - 55 : char;
    })
    .join('');
  
  // محاسبه mod 97
  let remainder = numeric;
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9);
    remainder = (parseInt(block, 10) % 97) + remainder.slice(9);
  }
  
  return parseInt(remainder, 10) % 97 === 1;
};

// فرمت کردن شماره شبا
export const formatIBAN = (iban: string): string => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

// اعتبارسنجی شماره تلفن ایران
export const isValidIranianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return /^09\d{9}$/.test(cleaned);
};

// اعتبارسنجی شماره فاکتور
export const isValidInvoiceNumber = (invoiceNumber: string): boolean => {
  return invoiceNumber.trim().length >= 3;
};

// اعتبارسنجی فاکتور کامل
export const validateInvoice = (invoice: Invoice): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // بررسی شماره فاکتور
  if (!invoice.number || invoice.number.trim() === '') {
    errors.push({
      field: 'number',
      message: 'شماره فاکتور الزامی است'
    });
  } else if (!isValidInvoiceNumber(invoice.number)) {
    errors.push({
      field: 'number',
      message: 'شماره فاکتور باید حداقل 3 کاراکتر باشد'
    });
  }
  
  // بررسی تاریخ
  if (!invoice.date || invoice.date.trim() === '') {
    errors.push({
      field: 'date',
      message: 'تاریخ الزامی است'
    });
  }
  
  // بررسی مشتری
  if (!invoice.customer.name || invoice.customer.name.trim() === '') {
    errors.push({
      field: 'customer.name',
      message: 'نام مشتری الزامی است'
    });
  }
  
  if (invoice.customer.phone && !isValidIranianPhone(invoice.customer.phone)) {
    errors.push({
      field: 'customer.phone',
      message: 'شماره تلفن معتبر نیست (مثال: 09123456789)'
    });
  }
  
  // بررسی خدمات
  if (!invoice.services || invoice.services.length === 0) {
    errors.push({
      field: 'services',
      message: 'حداقل یک خدمت باید اضافه شود'
    });
  } else {
    invoice.services.forEach((service, index) => {
      if (!service.description || service.description.trim() === '') {
        errors.push({
          field: `services.${index}.description`,
          message: `شرح خدمت ${index + 1} الزامی است`
        });
      }
      
      if (!service.quantity || service.quantity <= 0) {
        errors.push({
          field: `services.${index}.quantity`,
          message: `تعداد خدمت ${index + 1} باید بیشتر از صفر باشد`
        });
      }
      
      if (!service.price || service.price <= 0) {
        errors.push({
          field: `services.${index}.price`,
          message: `قیمت خدمت ${index + 1} باید بیشتر از صفر باشد`
        });
      }
    });
  }
  
  // بررسی اطلاعات پرداخت
  if (!invoice.paymentInfo.cardNumber || invoice.paymentInfo.cardNumber.trim() === '') {
    errors.push({
      field: 'paymentInfo.cardNumber',
      message: 'شماره کارت الزامی است'
    });
  } else if (!isValidIranianCard(invoice.paymentInfo.cardNumber)) {
    errors.push({
      field: 'paymentInfo.cardNumber',
      message: 'شماره کارت معتبر نیست'
    });
  }
  
  if (!invoice.paymentInfo.cardHolderName || invoice.paymentInfo.cardHolderName.trim() === '') {
    errors.push({
      field: 'paymentInfo.cardHolderName',
      message: 'نام صاحب کارت الزامی است'
    });
  }
  
  // ✅ بررسی شماره شبا (اختیاری ولی اگر وارد شده باید معتبر باشد)
  if (invoice.paymentInfo.iban && invoice.paymentInfo.iban.trim() !== '') {
    if (!isValidIranianIBAN(invoice.paymentInfo.iban)) {
      errors.push({
        field: 'paymentInfo.iban',
        message: 'شماره شبا معتبر نیست (مثال: IR020160000000000307454684)'
      });
    }
  }
  
  // بررسی تخفیف و مالیات
  if (invoice.discount !== undefined && (invoice.discount < 0 || invoice.discount > 100)) {
    errors.push({
      field: 'discount',
      message: 'درصد تخفیف باید بین 0 تا 100 باشد'
    });
  }
  
  if (invoice.tax !== undefined && (invoice.tax < 0 || invoice.tax > 100)) {
    errors.push({
      field: 'tax',
      message: 'درصد مالیات باید بین 0 تا 100 باشد'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// دریافت اولین خطا برای هر فیلد
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find(e => e.field === field);
  return error ? error.message : null;
};