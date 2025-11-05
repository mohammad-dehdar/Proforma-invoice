/**
 * کپی کردن متن به کلیپ‌بورد
 * @param text - متن مورد نظر برای کپی
 * @returns Promise<boolean> - true در صورت موفقیت، false در صورت خطا
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text || typeof text !== 'string') {
    return false;
  }

  try {
    // استفاده از Clipboard API (در صورت موجود بودن)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback برای مرورگرهای قدیمی‌تر
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  } catch (err) {
    console.error('خطا در کپی کردن به کلیپ‌بورد:', err);
    return false;
  }
};

/**
 * کپی کردن شماره کارت (حذف فاصله‌ها و خط تیره)
 * @param cardNumber - شماره کارت با فرمت یا بدون فرمت
 * @returns Promise<boolean>
 */
export const copyCardNumber = async (cardNumber: string): Promise<boolean> => {
  // حذف فاصله‌ها و خط تیره
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  return copyToClipboard(cleaned);
};

/**
 * کپی کردن شماره شبا (حذف فاصله‌ها)
 * @param iban - شماره شبا با فرمت یا بدون فرمت
 * @returns Promise<boolean>
 */
export const copyIBAN = async (iban: string): Promise<boolean> => {
  // حذف فاصله‌ها و تبدیل به حروف بزرگ
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return copyToClipboard(cleaned);
};

