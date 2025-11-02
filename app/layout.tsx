import type { Metadata } from "next";
import { dana, poppins } from "@/config/fonts/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Etmify - سیستم پیش فاکتور",
  description: "سیستم ایجاد و مدیریت پیش فاکتورهای فروش",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${dana.variable} ${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
