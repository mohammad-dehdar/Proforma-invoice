import { bankBins } from "@/constants/bank-bins"

export const detectBankFromCardNumber = (cardNumber: string): string | null => {
    if (!cardNumber) return null
  
    // حذف خط تیره‌ها و فضاها
    const cleanNumber = cardNumber.replace(/[\s-]/g, "")
  
    // استخراج 4 رقم اول (BIN)
    const prefix = cleanNumber.substring(0, 4)
  
    if (!prefix || prefix.length < 4) return null
  
    // جستجو در داده‌های بانکی
    const bankData = bankBins[prefix]
  
    if (!bankData || bankData.length === 0) return null
  
    // اگر فقط یک بانک برای این پیش‌شماره وجود دارد، آن را برگردان
    if (bankData.length === 1) {
      return bankData[0].bank
    }
  
    // اگر چند بانک برای این پیش‌شماره وجود دارد، سعی می‌کنیم با استفاده از رقم‌های بعدی تشخیص دهیم
    // استخراج 6 رقم اول برای تشخیص دقیق‌تر
    const sixDigits = cleanNumber.substring(0, 6)
  
    // بررسی prefix_examples برای هر بانک
    for (const bank of bankData) {
      for (const example of bank.prefix_examples) {
        const exampleClean = example.replace(/[\s-]/g, "")
        if (sixDigits.startsWith(exampleClean.substring(0, 6))) {
          return bank.bank
        }
      }
    }
  
    // اگر نتوانستیم تشخیص دهیم، اولین بانک را برمی‌گردانیم
    return bankData[0].bank
  }