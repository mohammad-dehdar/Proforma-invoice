"use client";

import type React from "react"

import Image from "next/image"
import { CreditCard, Check, Copy } from "lucide-react"
import { companyCards } from "@/constants/company-info"
import { detectBankFromCardNumber } from "@/utils/detect-bank"
import { copyCardNumber, copyIBAN } from "@/utils/copy-to-clipboard"
import { useState } from "react"
import { formatIBAN } from "@/utils/formatter"

interface CardSelectorProps {
  selectedCardNumber: string
  onCardSelect: (cardId: string) => void
}

export const CardSelector = ({ selectedCardNumber, onCardSelect }: CardSelectorProps) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const handleCopyCardNumber = async (e: React.MouseEvent, cardNumber: string) => {
    e.stopPropagation()
    const success = await copyCardNumber(cardNumber)
    if (success) {
      setCopiedItem(`card-${cardNumber}`)
      setTimeout(() => setCopiedItem(null), 2000)
    }
  }

  const handleCopyIBAN = async (e: React.MouseEvent, iban: string) => {
    e.stopPropagation()
    const success = await copyIBAN(iban)
    if (success) {
      setCopiedItem(`iban-${iban}`)
      setTimeout(() => setCopiedItem(null), 2000)
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CreditCard size={20} className="text-emerald-500" />
        <label className="text-base font-semibold text-foreground">انتخاب کارت پرداخت</label>
        <span className="text-red-500 font-bold">*</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companyCards.map((card) => {
          const isActive = card.cardNumber === selectedCardNumber
          const isHovered = hoveredCard === card.id
          const detectedBank = detectBankFromCardNumber(card.cardNumber)
          const displayBankName = detectedBank?.bank || card.bankName || ""
          const displayBankLogo = detectedBank?.logo || card.bankLogo || null

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onCardSelect(String(card.id))}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative w-full overflow-hidden rounded-xl transition-all duration-300 border backdrop-blur-sm ${
                isActive
                  ? "border-emerald-500/60 bg-gradient-to-br from-emerald-500/15 via-emerald-400/5 to-teal-500/10 shadow-lg shadow-emerald-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-background`}
            >
              {/* Background decorative elements */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isActive || isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl" />
                <div className="absolute -left-16 -bottom-16 w-40 h-40 rounded-full bg-gradient-to-tr from-teal-500/15 to-transparent blur-3xl" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-between h-full p-5 md:p-6 min-h-[240px] gap-5">
                {/* Bank logo and name */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 flex flex-col items-start">
                    <div className="text-xs md:text-sm font-medium text-white/60 mb-1.5">بانک</div>
                    <div className="text-sm md:text-base font-bold text-white/90 tracking-wide line-clamp-2">
                      {displayBankName || "BANK NAME"}
                    </div>
                  </div>
                  {displayBankLogo && (
                    <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-white/15 hover:bg-white/15 transition-colors">
                      <Image
                        src={displayBankLogo || "/placeholder.svg"}
                        alt={displayBankName || "لوگوی بانک"}
                        width={56}
                        height={28}
                        className="h-6 md:h-7 w-auto object-contain"
                        priority={false}
                      />
                    </div>
                  )}
                </div>

                {/* Card number */}
                <div className="flex flex-col items-start w-full gap-1">
                  <div className="text-xs md:text-sm font-medium text-white/60">شماره کارت</div>
                  <div className="w-full">
                    <div
                      onClick={(e) => handleCopyCardNumber(e, card.cardNumber)}
                      className={`group/copy w-full flex items-center justify-between font-mono text-lg md:text-xl tracking-widest font-light p-3 rounded-lg transition-all cursor-pointer ${
                        copiedItem === `card-${card.cardNumber}`
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-white/80 bg-white/5 group-hover:bg-white/10 group-hover:text-white"
                      }`}
                      title="کلیک برای کپی"
                    >
                      <span>
                        {copiedItem === `card-${card.cardNumber}` ? "✓ کپی شد" : card.cardNumber.replace(/-/g, " ")}
                      </span>
                      {copiedItem !== `card-${card.cardNumber}` && (
                        <Copy size={16} className="text-white/40 group-hover/copy:text-white/60" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Card holder and IBAN */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/10">
                  <div className="flex flex-col items-start">
                    <div className="text-xs font-medium text-white/60 mb-1.5">صاحب کارت</div>
                    <div className="text-xs md:text-sm font-semibold text-white/80 uppercase tracking-tight line-clamp-2">
                      {card.cardHolderName || "HOLDER"}
                    </div>
                  </div>

                  {card.iban && (
                    <div
                      onClick={(e) => handleCopyIBAN(e, card.iban!)}
                      className={`cursor-pointer col-span-2 flex flex-col items-end transition-all rounded-lg p-2 ${
                        copiedItem === `iban-${card.iban}` ? "bg-emerald-500/15" : "bg-white/5 hover:bg-white/10"
                      }`}
                      title="کلیک برای کپی"
                    >
                      <div className="text-xs font-medium text-white/60 mb-0.5">شماره شبا</div>
                      <div
                        className={`font-mono text-xs break-all transition-colors ${
                          copiedItem === `iban-${card.iban}` ? "text-emerald-400" : "text-white/70"
                        }`}
                        dir="ltr"
                      >
                        {copiedItem === `iban-${card.iban}` ? "✓" : formatIBAN(card.iban!)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected indicator */}
              {isActive && (
                <>
                  <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-xl pointer-events-none transition-opacity duration-300" />
                  <div className="absolute top-3 left-3 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg animate-pulse">
                    <Check size={16} className="text-white font-bold" strokeWidth={3} />
                  </div>
                </>
              )}
            </button>
          )
        })}
      </div>

      <p className="text-xs md:text-sm text-white/50 text-right">کارت انتخاب‌شده برای پرداخت استفاده خواهد شد</p>
    </div>
  )
}
