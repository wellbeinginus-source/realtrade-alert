import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "실거래가 알림 | 관심 지역 부동산 거래 알림 서비스",
  description: "관심 지역 실거래가가 올라오면 바로 알려드려요. 국토부 실거래가 데이터 기반 자동 알림.",
  keywords: ["실거래가", "부동산 실거래가", "아파트 실거래가 알림", "부동산 알림"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
