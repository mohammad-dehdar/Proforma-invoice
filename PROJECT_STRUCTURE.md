# ساختار پروژه Proforma Invoice

## 📁 نمای کلی ساختار پروژه

```
Proforma-invoice/
│
├── 📱 app/                          # Next.js App Router
│   ├── favicon.ico
│   ├── globals.css                  # استایل‌های سراسری
│   ├── layout.tsx                   # Layout اصلی برنامه
│   └── page.tsx                     # صفحه اصلی (Home)
│
├── 🧩 components/                   # کامپوننت‌های React
│   ├── atoms/                       # کامپوننت‌های اتمی (کوچک‌ترین واحد)
│   │   ├── Buttons.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   ├── Select.tsx
│   │   └── index.ts                 # Export مرکزی
│   │
│   ├── layout/                      # کامپوننت‌های لایه‌بندی
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── MainLayout.tsx
│   │   └── index.ts
│   │
│   ├── templates/                   # کامپوننت‌های قالب (Template)
│   │   ├── dashboard/
│   │   ├── discount-tax/
│   │   ├── email-modal/
│   │   ├── invoice-actions/
│   │   ├── invoice-form/
│   │   ├── invoice-history/
│   │   ├── invoice-preview/
│   │   │   └── print-optimized.tsx  # نسخه بهینه برای چاپ
│   │   ├── service-list/
│   │   └── index.tsx
│   │
│   └── etmify-invoice-form.tsx      # فرم اصلی فاکتور
│
├── ⚙️ config/                       # تنظیمات پروژه
│   ├── env.ts                       # متغیرهای محیطی
│   └── fonts/                       # فایل‌های فونت
│       ├── fonts.ts                 # تنظیمات فونت
│       ├── LICENSE.txt
│       ├── ttf/
│       │   └── Poppins-Regular.ttf
│       └── woff2/
│           └── DanaVF.woff2
│
├── 📊 constants/                    # ثوابت برنامه
│   └── company-info.ts              # اطلاعات شرکت
│
├── 🎣 hooks/                        # Custom React Hooks
│   └── use-local-storage.ts         # هوک مدیریت Local Storage
│
├── 🛠️ lib/                          # کتابخانه‌های کمکی
│   └── utils.ts                     # توابع کمکی (clsx, tailwind-merge)
│
├── 🗄️ store/                        # State Management (Zustand)
│   └── use-invoice-store.ts         # استور مدیریت فاکتور
│
├── 📝 types/                        # TypeScript Type Definitions
│   └── type.ts                      # تعاریف تایپ
│
├── 🔧 utils/                        # توابع کمکی عمومی
│   └── formatter.ts                 # فرمت‌کننده‌ها (مثل فرمت پول، تاریخ)
│
├── 🎨 public/                       # فایل‌های استاتیک
│   ├── images/
│   │   └── logo.png
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── 📦 Configuration Files
│   ├── package.json                 # وابستگی‌ها و اسکریپت‌ها
│   ├── package-lock.json
│   ├── tsconfig.json                # تنظیمات TypeScript
│   ├── next.config.ts               # تنظیمات Next.js
│   ├── tailwind.config.js           # تنظیمات Tailwind CSS
│   ├── postcss.config.mjs           # تنظیمات PostCSS
│   └── eslint.config.mjs            # تنظیمات ESLint
│
└── 📖 README.md                     # مستندات پروژه
```

## 🏗️ معماری پروژه (Architecture)

### 1. **لایه Presentation (نمایش)**
   - `app/` - صفحات و روتینگ Next.js
   - `components/` - کامپوننت‌های UI

### 2. **لایه Business Logic (منطق تجاری)**
   - `store/` - مدیریت state با Zustand
   - `hooks/` - منطق قابل استفاده مجدد
   - `utils/` - توابع کمکی

### 3. **لایه Data Layer (داده)**
   - `types/` - تعاریف تایپ TypeScript
   - `constants/` - داده‌های ثابت

### 4. **لایه Configuration (پیکربندی)**
   - `config/` - تنظیمات محیطی و فونت‌ها
   - فایل‌های تنظیمات ریشه (config files)

## 📦 وابستگی‌های اصلی (Dependencies)

### Core
- **Next.js 16.0.0** - فریمورک React
- **React 19.2.0** - کتابخانه UI
- **TypeScript 5** - تایپ‌اسکریپت

### State Management
- **Zustand 5.0.0** - مدیریت state ساده و سبک

### Styling
- **Tailwind CSS 4** - فریمورک CSS utility-first
- **clsx & tailwind-merge** - ترکیب کلاس‌های CSS

### Icons
- **lucide-react** - آیکون‌ها

## 🎯 الگوی معماری (Architecture Pattern)

### Atomic Design Pattern
پروژه از الگوی Atomic Design استفاده می‌کند:

```
atoms/          → کامپوننت‌های پایه (Button, Input, Label)
templates/      → کامپوننت‌های صفحه/قالب (Dashboard, Invoice Form)
components/     → کامپوننت‌های ترکیبی
```

### Feature-based Organization
سازمان‌دهی بر اساس ویژگی‌های کاری:
- Invoice Form
- Invoice Preview
- Invoice History
- Dashboard
- Discount & Tax
- Email Modal

## 🔄 جریان داده (Data Flow)

```
User Input
    ↓
Components (UI)
    ↓
Zustand Store (State Management)
    ↓
Local Storage (Persistence)
    ↓
Utils/Formatters (Data Processing)
    ↓
Display/Export
```

## 🗂️ مسیرهای Import (Path Aliases)

با استفاده از `tsconfig.json`:
- `@/*` → ریشه پروژه (`./`)

مثال:
```typescript
import EtmifyInvoiceForm from "@/components/etmify-invoice-form";
import { useInvoiceStore } from "@/store/use-invoice-store";
```

## 📱 صفحات و Routes

- `/` - صفحه اصلی با فرم فاکتور (`app/page.tsx`)

## 🎨 استایل‌دهی

- **Tailwind CSS 4** - استایل‌دهی اصلی
- **PostCSS** - پردازش CSS
- **Custom Fonts** - Poppins و DanaVF
- **Global Styles** - `app/globals.css`

## 💾 مدیریت State

- **Zustand Store**: `store/use-invoice-store.ts`
- **Local Storage Hook**: `hooks/use-local-storage.ts`

## 📝 Type Safety

- تمام فایل‌ها با TypeScript نوشته شده‌اند
- تعاریف تایپ در `types/type.ts`

---

**تاریخ ایجاد**: $(Get-Date -Format "yyyy-MM-dd")
**نسخه پروژه**: 0.1.0

