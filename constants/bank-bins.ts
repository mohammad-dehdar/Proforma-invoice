export interface BankBin {
  bank: string
  prefix_examples: string[]
  logo?: string
}

export interface BankBinsData {
  [prefix: string]: BankBin[]
}

export const bankLogos: Record<string, string> = {
  "کارآفرین": "/images/bank-karafarin-1.png",
  "انصار": "/images/bank-ansar.png",
  "تجارت": "/images/bank-tejarat.png",
  "پاسارگاد": "/images/bank-pasargad.png",
  "ایران زمین": "/images/bank-iranzamin.png",
  "شهر": "/images/bank-shahr.png",
  "پارسیان": "/images/bank-parsian.png",
  "توسعه تعاون": "/images/postbank.png",
  "سپه": "/images/bank-sepah.png",
  "رفاه کارگران": "/images/bank-refah.png",
  "صادرات ایران": "/images/bank-saderat.png",
  "کشاورزی": "/images/bank-keshavarzi.png",
  "ملی ایران": "/images/bank-meli.png",
  "قرض‌الحسنه مهر ایران": "/images/Bank-Mehr-Iran.png",
  "ملت": "/images/bank-mellat.png",
  "سامان": "/images/bank-saman.png",
  "سرمایه": "/images/bank-sarmayeh.png",
  "سینا": "/images/bank-sina.png",
  "مسکن": "/images/bank-maskan.png",
  "مرکزی": "/images/bank-markazi.png",
  "رسالت": "/images/bank-resalat.png",
  "گردشگری": "/images/gardeshgari.png",
  "صنعت و معدن": "/images/Sanat-va-madan.png",
  "آینده": "/images/bank-ayandeh.png"
}

export const bankBins: BankBinsData = {
  "6274": [
    { bank: "اقتصاد نوین", prefix_examples: ["6274-12"], logo: bankLogos["اقتصاد نوین"] },
    { bank: "کارآفرین", prefix_examples: ["6274-88"], logo: bankLogos["کارآفرین"] }
  ],
  "2071": [
    { bank: "توسعه صادرات ایران", prefix_examples: ["2071-77"], logo: bankLogos["توسعه صادرات ایران"] }
  ],
  "6273": [
    { bank: "انصار", prefix_examples: ["6273-81"], logo: bankLogos["انصار"] },
    { bank: "تجارت", prefix_examples: ["6273-53"], logo: bankLogos["تجارت"] }
  ],
  "5022": [
    { bank: "پاسارگاد", prefix_examples: ["5022-29"], logo: bankLogos["پاسارگاد"] }
  ],
  "5057": [
    { bank: "ایران زمین", prefix_examples: ["5057-85"], logo: bankLogos["ایران زمین"] }
  ],
  "5028": [
    { bank: "شهر", prefix_examples: ["5028-06"], logo: bankLogos["شهر"] }
  ],
  "6221": [
    { bank: "پارسیان", prefix_examples: ["6221-06"], logo: bankLogos["پارسیان"] }
  ],
  "5029": [
    { bank: "توسعه تعاون", prefix_examples: ["5029-08"], logo: bankLogos["توسعه تعاون"] },
    { bank: "کارآفرین", prefix_examples: ["5029-10"], logo: bankLogos["کارآفرین"] },
    { bank: "دی", prefix_examples: ["5029-38"], logo: bankLogos["دی"] }
  ],
  "6391": [
    { bank: "پارسیان", prefix_examples: ["6391-94"], logo: bankLogos["پارسیان"] }
  ],
  "6278": [
    { bank: "پارسیان", prefix_examples: ["6278-84"], logo: bankLogos["پارسیان"] }
  ],
  "5054": [
    { bank: "گردشگری", prefix_examples: ["5054-16"], logo: bankLogos["گردشگری"] }
  ],
  "6362": [
    { bank: "آینده", prefix_examples: ["6362-14"], logo: bankLogos["آینده"] }
  ],
  "5058": [
    { bank: "مؤسسه اعتباری کوثر (سپه)", prefix_examples: ["5058-01"], logo: bankLogos["سپه"] }
  ],
  "5892": [
    { bank: "سپه", prefix_examples: ["5892-10"], logo: bankLogos["سپه"] }
  ],
  "5894": [
    { bank: "رفاه کارگران", prefix_examples: ["5894-63"], logo: bankLogos["رفاه کارگران"] }
  ],
  "6276": [
    { bank: "توسعه صادرات ایران", prefix_examples: ["6276-48"], logo: bankLogos["توسعه صادرات ایران"] }
  ],
  "6037": [
    { bank: "صادرات ایران", prefix_examples: ["6037-69"], logo: bankLogos["صادرات ایران"] },
    { bank: "کشاورزی", prefix_examples: ["6037-70"], logo: bankLogos["کشاورزی"] },
    { bank: "ملی ایران", prefix_examples: ["6037-99"], logo: bankLogos["ملی ایران"] }
  ],
  "6063": [
    { bank: "قرض‌الحسنه مهر ایران", prefix_examples: ["6063-73"], logo: bankLogos["قرض‌الحسنه مهر ایران"] }
  ],
  "6104": [
    { bank: "ملت", prefix_examples: ["6104-33"], logo: bankLogos["ملت"] }
  ],
  "6219": [
    { bank: "سامان", prefix_examples: ["6219-86"], logo: bankLogos["سامان"] }
  ],
  "6396": [
    { bank: "سرمایه", prefix_examples: ["6396-07"], logo: bankLogos["سرمایه"] }
  ],
  "6393": [
    { bank: "پاسارگاد", prefix_examples: ["6393-46", "6393-47"], logo: bankLogos["پاسارگاد"] },
    { bank: "سینا", prefix_examples: ["6393-46"], logo: bankLogos["سینا"] }
  ],
  "6395": [
    { bank: "قوامین", prefix_examples: ["6395-99"], logo: bankLogos["قوامین"] }
  ],
  "6280": [
    { bank: "مسکن", prefix_examples: ["6280-23"], logo: bankLogos["مسکن"] }
  ],
  "6281": [
    { bank: "موسسه/توسعه", prefix_examples: ["6281-57"], logo: bankLogos["موسسه/توسعه"] }
  ],
  "6392": [
    { bank: "کشاورزی / دیگر", prefix_examples: ["6392-17"], logo: bankLogos["کشاورزی"] }
  ],
  "6367": [
    { bank: "مرکزی", prefix_examples: ["6367-95"], logo: bankLogos["مرکزی"] }
  ],
  "6369": [
    { bank: "حکمت ایرانیان (سپه)", prefix_examples: ["6369-49"], logo: bankLogos["سپه"] }
  ]
}
