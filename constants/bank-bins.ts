export interface BankBin {
  bank: string
  prefix_examples: string[]
}

export interface BankBinsData {
  [prefix: string]: BankBin[]
}

export const bankBins: BankBinsData = {
  "6274": [
    { bank: "اقتصاد نوین", prefix_examples: ["6274-12"] },
    { bank: "کارآفرین", prefix_examples: ["6274-88"] }
  ],
  "2071": [
    { bank: "توسعه صادرات ایران", prefix_examples: ["2071-77"] }
  ],
  "6273": [
    { bank: "انصار", prefix_examples: ["6273-81"] },
    { bank: "تجارت", prefix_examples: ["6273-53"] }
  ],
  "5022": [
    { bank: "پاسارگاد", prefix_examples: ["5022-29"] }
  ],
  "5057": [
    { bank: "ایران زمین", prefix_examples: ["5057-85"] }
  ],
  "5028": [
    { bank: "شهر", prefix_examples: ["5028-06"] }
  ],
  "6221": [
    { bank: "پارسیان", prefix_examples: ["6221-06"] }
  ],
  "5029": [
    { bank: "توسعه تعاون", prefix_examples: ["5029-08"] },
    { bank: "کارآفرین", prefix_examples: ["5029-10"] },
    { bank: "دی", prefix_examples: ["5029-38"] }
  ],
  "6391": [
    { bank: "پارسیان", prefix_examples: ["6391-94"] }
  ],
  "6278": [
    { bank: "پارسیان", prefix_examples: ["6278-84"] }
  ],
  "5054": [
    { bank: "گردشگری", prefix_examples: ["5054-16"] }
  ],
  "6362": [
    { bank: "آینده", prefix_examples: ["6362-14"] }
  ],
  "5058": [
    { bank: "مؤسسه اعتباری کوثر (سپه)", prefix_examples: ["5058-01"] }
  ],
  "5892": [
    { bank: "سپه", prefix_examples: ["5892-10"] }
  ],
  "5894": [
    { bank: "رفاه کارگران", prefix_examples: ["5894-63"] }
  ],
  "6276": [
    { bank: "توسعه صادرات ایران", prefix_examples: ["6276-48"] }
  ],
  "6037": [
    { bank: "صادرات ایران", prefix_examples: ["6037-69"] },
    { bank: "کشاورزی", prefix_examples: ["6037-70"] },
    { bank: "ملی ایران", prefix_examples: ["6037-99"] }
  ],
  "6063": [
    { bank: "قرض‌الحسنه مهر ایران", prefix_examples: ["6063-73"] }
  ],
  "6104": [
    { bank: "ملت", prefix_examples: ["6104-33"] }
  ],
  "6219": [
    { bank: "سامان", prefix_examples: ["6219-86"] }
  ],
  "6396": [
    { bank: "سرمایه", prefix_examples: ["6396-07"] }
  ],
  "6393": [
    { bank: "پاسارگاد", prefix_examples: ["6393-46", "6393-47"] },
    { bank: "سینا", prefix_examples: ["6393-46"] }
  ],
  "6395": [
    { bank: "قوامین", prefix_examples: ["6395-99"] }
  ],
  "6280": [
    { bank: "مسکن", prefix_examples: ["6280-23"] }
  ],
  "6281": [
    { bank: "موسسه/توسعه", prefix_examples: ["6281-57"] }
  ],
  "6392": [
    { bank: "کشاورزی / دیگر", prefix_examples: ["6392-17"] }
  ],
  "6367": [
    { bank: "مرکزی", prefix_examples: ["6367-95"] }
  ],
  "6369": [
    { bank: "حکمت ایرانیان (سپه)", prefix_examples: ["6369-49"] }
  ]
}
