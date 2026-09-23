import { AboutV6Page } from "@/components/about/v6/AboutV6Page";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Люди за каждым ПК — 310FPS Custom Lab",
    description:
        "История 310FPS, основатель Павел Иванов, работа лаборатории и отзывы клиентов. Собираем игровые ПК в Санкт-Петербурге с 2017 года.",
    path: "/about",
});

const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "О лаборатории 310FPS Custom Lab",
    url: absoluteUrl("/about"),
    inLanguage: "ru-RU",
    mainEntity: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        foundingDate: "2017",
        telephone: siteConfig.phoneE164,
        areaServed: "RU",
    },
};

export default function AboutPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
            <AboutV6Page />
        </>
    );
}
