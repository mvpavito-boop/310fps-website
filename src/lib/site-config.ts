import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://310fps-lab.vercel.app";
const DEFAULT_OG_IMAGE = "/opengraph-image";
const DEFAULT_OG_IMAGE_ALT = "310FPS Custom Lab — сборка игровых ПК на заказ";

function normalizeUrl(url: string | undefined): string {
    const fallback = DEFAULT_SITE_URL;
    const value = (url || fallback).trim() || fallback;
    return value.replace(/\/+$/, "");
}

export const siteConfig = {
    name: "310FPS Custom Lab",
    description: "Сборка игровых ПК на заказ в Санкт-Петербурге. Готовые решения, индивидуальная конфигурация, стресс-тест и паспорт ПК перед выдачей.",
    url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL),
    phone: "+7 (911) 702-70-70",
    phoneHref: "tel:+79117027070",
    phoneE164: "+79117027070",
    telegramUrl: "https://t.me/lab310fps",
    telegramDirectUrl: "https://t.me/lab310fps?direct",
    telegramReviewsUrl: "https://t.me/lab310fps_reviews",
    vkUrl: "https://vk.com/pc310fps",
    avitoUrl: "https://www.avito.ru/brands/310fps",
    city: "Санкт-Петербург",
    hours: "10:00 – 21:00",
    keywords: [
        "310FPS",
        "сборка ПК",
        "игровой компьютер на заказ",
        "готовый игровой ПК",
        "игровой ПК Full HD",
        "игровой ПК 2K",
        "игровой ПК 4K",
        "конфигуратор ПК",
        "сборка ПК Санкт-Петербург",
        "кастомный ПК",
        "310FPS VECTOR",
        "310FPS SIGNAL",
        "310FPS CANVAS",
        "310FPS SPECTRE",
        "310FPS AXIOM",
    ],
};

export function absoluteUrl(path = ""): string {
    if (!path) return siteConfig.url;
    if (/^https?:\/\//i.test(path)) return path;
    return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetadataOptions = {
    title: string;
    description: string;
    path: string;
    image?: string;
    imageAlt?: string;
    noIndex?: boolean;
};

export function createPageMetadata({
    title,
    description,
    path,
    image = DEFAULT_OG_IMAGE,
    imageAlt = DEFAULT_OG_IMAGE_ALT,
    noIndex = false,
}: PageMetadataOptions): Metadata {
    const url = absoluteUrl(path);
    const imageUrl = absoluteUrl(image);

    return {
        title,
        description,
        alternates: {
            canonical: url,
        },
        robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
        openGraph: {
            title,
            description,
            url,
            siteName: siteConfig.name,
            images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
            type: "website",
            locale: "ru_RU",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
        },
    };
}
