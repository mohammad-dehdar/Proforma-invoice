"use client"

import { CreditCard, Check } from "lucide-react"
import { companyCards } from "@/constants/company-info"
import { detectBankFromCardNumber } from "@/utils/detect-bank"
import { useState } from "react"

interface CardSelectorProps {
  selectedCardNumber: string
  onCardSelect: (cardId: string) => void
}

export const CardSelector = ({ selectedCardNumber, onCardSelect }: CardSelectorProps) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard size={18} className="text-blue-400" />
        <label className="text-sm font-semibold text-blue-400">انتخاب کارت پرداخت</label>
        <span className="text-red-500">*</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {companyCards.map((card) => {
          const isActive = card.cardNumber === selectedCardNumber
          const isHovered = hoveredCard === card.id
          // تشخیص خودکار نام بانک
          const displayBankName = detectBankFromCardNumber(card.cardNumber) || ""

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onCardSelect(String(card.id))}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative h-32 rounded-xl overflow-hidden transition-all duration-200 border ${
                isActive
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                  : "border-gray-600 bg-gray-800 hover:border-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer`}
            >
              {/* Card Background */}
              <div
                className={`absolute inset-0 transition-all duration-200 ${
                  isActive || isHovered
                    ? "bg-linear-to-br from-blue-600/20 via-blue-500/15 to-blue-700/20"
                    : "bg-linear-to-br from-gray-700/50 via-gray-800/50 to-gray-900/50"
                }`}
              />

              {/* Decorative circles */}
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/5" />
              <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white/3" />

              {/* Content */}
              <div className="relative h-full p-3 flex flex-col justify-between text-white z-10">
                {/* Top section - Logo and checkmark */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-4 rounded bg-yellow-400/80 shadow-sm" />
                    <div className="w-2 h-4 rounded bg-yellow-300/70 -ml-1" />
                  </div>
                  {isActive && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 border border-blue-400">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Middle section - Card number */}
                <div className="space-y-1">
                  <div className="font-mono text-xs text-gray-300 tracking-wide">شماره کارت</div>
                  <div className="font-mono text-sm sm:text-base font-semibold tracking-wider">{card.cardNumber}</div>
                </div>

                {/* Bottom section - Holder name and bank */}
                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-xs text-gray-400">صاحب کارت</div>
                    <div className="font-semibold text-xs">{card.cardHolderName}</div>
                  </div>
                  {displayBankName && (
                    <div className="text-xs text-gray-300 bg-gray-700/50 px-2 py-0.5 rounded">{displayBankName}</div>
                  )}
                </div>
              </div>

              {/* Active border effect */}
              {isActive && <div className="absolute inset-0 border-2 border-blue-500/50 rounded-xl" />}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 text-right mt-2">کارت انتخاب‌شده برای پرداخت استفاده خواهد شد</p>
    </div>
  )
}
