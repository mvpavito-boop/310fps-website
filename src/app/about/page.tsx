import { AboutPageContent } from "@/components/about/AboutPageContent";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "О лаборатории | 310FPS Custom Lab",
    description:
        "310FPS Custom Lab — сборка игровых ПК в Санкт-Петербурге с 2017 года. Более 2000 собранных систем, стресс-тест 24 часа и паспорт сборки на каждый компьютер.",
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
            <AboutPageContent />
        </>
    );
}
