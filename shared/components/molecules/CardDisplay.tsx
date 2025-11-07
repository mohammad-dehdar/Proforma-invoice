"use client"

import Image from "next/image"
import { CreditCard } from "lucide-react"
import { detectBankFromCardNumber } from "@/utils/detect-bank"

interface CardDisplayProps {
  cardNumber: string
  cardHolderName: string
  bankName?: string
  bankLogo?: string | null
  iban?: string
}

export const CardDisplay = ({ cardNumber, cardHolderName, bankName, bankLogo, iban }: CardDisplayProps) => {
  const detectedBank = detectBankFromCardNumber(cardNumber)
  const displayBankName = bankName || detectedBank?.bank || "BANK NAME"
  const displayBankLogo = bankLogo || detectedBank?.logo || null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard size={18} className="text-blue-400" />
        <label className="text-sm font-semibold text-blue-400">خلاصه کارت پرداخت</label>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-700 bg-linear-to-br from-gray-900 via-black to-gray-950 p-6 sm:p-8 text-white shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-linear-to-br from-red-600/10 to-yellow-500/10 blur-2xl" />
        <div className="absolute -left-12 bottom-0 w-40 h-40 rounded-full bg-linear-to-tr from-blue-600/5 to-purple-600/5 blur-3xl" />

        {/* Card content */}
        <div className="relative z-10 flex flex-col justify-between min-h-[240px]">
          {/* Top row: Mastercard logo + Chip + Bank name */}
          <div className="flex items-start justify-between mb-8">
            {/* Mastercard circles */}
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-red-500 shadow-lg" />
              <div className="w-8 h-8 rounded-full bg-yellow-400 shadow-lg -ml-3" />
            </div>

            {/* Chip */}
            <div className="flex gap-0.5 bg-yellow-400/20 p-2 rounded">
              <div className="w-2 h-3 bg-yellow-500" />
              <div className="w-2 h-3 bg-yellow-500" />
              <div className="w-2 h-3 bg-yellow-500" />
              <div className="w-2 h-3 bg-yellow-500" />
            </div>

            {/* Bank name on the right */}
            <div className="text-right flex flex-col items-end gap-1">
              {displayBankLogo ? (
                <div className="bg-white/5 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
                  <Image
                    src={displayBankLogo}
                    alt={displayBankName}
                    width={64}
                    height={32}
                    className="h-8 w-auto object-contain"
                    priority={false}
                  />
                </div>
              ) : null}
              <div className="text-xs text-gray-400 font-light">بانک</div>
              <div className="text-base font-bold tracking-wide">{displayBankName}</div>
            </div>
          </div>

          {/* Middle: Card number with label */}
          <div className="mb-8">
            <div className="text-xs text-gray-400 font-light mb-2">شماره کارت</div>
            <div className="font-mono text-2xl sm:text-3xl tracking-[0.35em] font-light text-gray-100 wrap-break-word">
              {cardNumber || "0000 0000 0000 0000"}
            </div>
          </div>

          {/* Bottom row: Cardholder + Expiry date */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-gray-400 font-light mb-1">صاحب کارت</div>
              <div className="text-sm sm:text-base font-semibold uppercase tracking-wide">
                {cardHolderName || "CARD HOLDER"}
              </div>
            </div>

            {/* IBAN/Expiry on right side */}
            <div className="text-right">
              <div className="text-xs text-gray-400 font-light mb-1">تاریخ انقضا</div>
              <div className="font-mono text-sm">{iban || "MM/YY"}</div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-right">اطلاعات بالا فقط برای نمایش است</p>
    </div>
  )
}
