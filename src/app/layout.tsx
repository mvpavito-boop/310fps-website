import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import "./globals.css";

import { BootOverlay } from "@/components/layout/BootOverlay";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { Toaster } from "sonner";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { AnalyticsEvents } from "@/components/analytics/AnalyticsEvents";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";

/* Дисплейный шрифт: заголовки секций и hero. Кириллица и цифры есть. */
const unbounded = Unbounded({
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

/* Основной текст */
const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

/* Технические данные: артикулы, цены, спецификации, лейблы секций */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Сборка игровых ПК на заказ`,
    template: "%s",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "gaming computers",
  keywords: siteConfig.keywords,
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: `${siteConfig.name} | Сборка игровых ПК на заказ`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: "310FPS Custom Lab — сборка игровых ПК на заказ" }],
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [absoluteUrl("/opengraph-image")],
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${manrope.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body
        className={`grain font-sans antialiased min-h-screen flex flex-col bg-ink text-bone`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": `${siteConfig.url}/#business`,
              "name": siteConfig.name,
              "description": "Лаборатория игровых ПК в Санкт-Петербурге. Сборка на заказ с паспортом качества.",
              "url": siteConfig.url,
              "telephone": siteConfig.phoneE164,
              "image": absoluteUrl("/opengraph-image"),
              "priceRange": "₽₽₽",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Санкт-Петербург",
                "addressCountry": "RU"
              },
              "areaServed": [
                {
                  "@type": "City",
                  "name": "Санкт-Петербург"
                },
                {
                  "@type": "Country",
                  "name": "Россия"
                }
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": siteConfig.phoneE164,
                "contactType": "customer support",
                "availableLanguage": ["ru"],
                "url": siteConfig.telegramDirectUrl
              },
              "sameAs": [
                siteConfig.telegramUrl,
                siteConfig.telegramReviewsUrl,
                siteConfig.vkUrl
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${siteConfig.url}/#website`,
              "name": siteConfig.name,
              "url": siteConfig.url,
              "inLanguage": "ru-RU",
              "publisher": {
                "@id": `${siteConfig.url}/#business`
              },
              "about": [
                "сборка игровых ПК",
                "готовые игровые компьютеры",
                "кастомные ПК в Санкт-Петербурге"
              ]
            })
          }}
        />
        <BootOverlay />
        <Header />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
        {/* Отступ под фиксированную панель кнопок на мобильном */}
        <div className="h-[64px] lg:hidden" aria-hidden />
        <MobileCtaBar />
        <AnalyticsEvents />
        <YandexMetrika />
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
