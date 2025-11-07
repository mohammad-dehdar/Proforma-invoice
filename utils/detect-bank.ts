import { bankBins } from "@/constants/bank-bins"

export interface DetectedBankInfo {
  bank: string
  logo?: string
}

export const detectBankFromCardNumber = (cardNumber: string): DetectedBankInfo | null => {
  if (!cardNumber) return null

  const cleanNumber = cardNumber.replace(/[\s-]/g, "")
  const prefix = cleanNumber.substring(0, 4)

  if (!prefix || prefix.length < 4) return null

  const bankData = bankBins[prefix]

  if (!bankData || bankData.length === 0) return null

  if (bankData.length === 1) {
    const { bank, logo } = bankData[0]
    return { bank, logo }
  }

  const sixDigits = cleanNumber.substring(0, 6)

  for (const bank of bankData) {
    for (const example of bank.prefix_examples) {
      const exampleClean = example.replace(/[\s-]/g, "")
      if (sixDigits.startsWith(exampleClean.substring(0, 6))) {
        return { bank: bank.bank, logo: bank.logo }
      }
    }
  }

  const fallback = bankData[0]
  return { bank: fallback.bank, logo: fallback.logo }
}