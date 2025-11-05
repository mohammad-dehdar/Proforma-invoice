"use client"

import { CreditCard } from "lucide-react"

interface CardDisplayProps {
  cardNumber: string
  cardHolderName: string
  bankName?: string
  iban?: string
}

export const CardDisplay = ({ cardNumber, cardHolderName, bankName, iban }: CardDisplayProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard size={18} className="text-blue-400" />
        <label className="text-sm font-semibold text-blue-400">خلاصه کارت پرداخت</label>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-gray-600 bg-linear-to-br from-gray-700 via-gray-800 to-gray-900 p-4 sm:p-5 text-white shadow-lg">
        {/* Decorative background elements */}
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/5" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-blue-500/5" />

        {/* Card content */}
        <div className="relative z-10 flex flex-col justify-between min-h-[180px]">
          {/* Top: Chip and bank name */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-5 rounded bg-yellow-400/80 shadow-sm" />
              <div className="w-2.5 h-5 rounded bg-yellow-300/70 -ml-1" />
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-300 mb-0.5">بانک</div>
              <div className="text-sm font-semibold">{bankName || "-"}</div>
            </div>
          </div>

          {/* Middle: Card number */}
          <div className="mb-6">
            <div className="font-mono text-lg sm:text-xl md:text-2xl tracking-widest font-light">
              {cardNumber || "---- ---- ---- ----"}
            </div>
          </div>

          {/* Bottom: Cardholder info */}
          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="text-right">
              <div className="text-gray-300 mb-1">صاحب کارت</div>
              <div className="font-semibold">{cardHolderName || "-"}</div>
            </div>
            <div className="text-right" dir="ltr">
              <div className="text-gray-300 mb-1">IBAN</div>
              <div className="font-mono break-all text-xs">{iban || "IR-- ---- ---- ---- ---- ---- --"}</div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-right">اطلاعات بالا فقط برای نمایش است</p>
    </div>
  )
}
