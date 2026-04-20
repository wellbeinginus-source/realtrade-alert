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
  metadataBase: new URL("https://realtrade-alert.vercel.app"),
  title: {
    default: "실거래가 알림 | 관심 지역 부동산 거래 알림 서비스",
    template: "%s | 실거래가 알림",
  },
  description:
    "관심 지역 실거래가가 올라오면 바로 알려드려요. 국토부 실거래가 데이터 기반, 지역·가격·면적 조건 맞춤 자동 알림.",
  keywords: [
    "실거래가",
    "부동산 실거래가",
    "아파트 실거래가 알림",
    "부동산 알림",
    "실거래가 조회",
    "아파트 시세",
    "부동산 거래 알림",
    "국토부 실거래가",
  ],
  openGraph: {
    title: "실거래가 알림 | 관심 지역 부동산 거래 알림",
    description:
      "관심 지역 실거래가가 올라오면 바로 알려드려요. 지역·가격·면적 조건 맞춤 알림.",
    type: "website",
    locale: "ko_KR",
    url: "https://realtrade-alert.vercel.app",
    siteName: "실거래가 알림",
  },
  robots: { index: true, follow: true },
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

      <head>
        <meta name="naver-site-verification" content="15bf7036f6b71afbcf2e4d6d870f47f66a62e5c3" />
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-6L251D0CYV"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6L251D0CYV');
            `,
          }}
        />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3913442122539155"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
