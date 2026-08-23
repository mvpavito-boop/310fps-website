import { notFound } from "next/navigation";
import { GamingPcContent } from "@/components/gaming-pc/GamingPcContent";
import { getAllGamingPcLandings, getGamingPcLandingBySlug } from "@/lib/data/gaming-pc-pages";
import { absoluteUrl, createPageMetadata } from "@/lib/site-config";

type PageProps = { params: Promise<{ resolution: string }> };

export function generateStaticParams() {
    return getAllGamingPcLandings().map((page) => ({ resolution: page.slug }));
}

export async function generateMetadata({ params }: PageProps) {
    const { resolution } = await params;
    const page = getGamingPcLandingBySlug(resolution);

    if (!page) {
        return createPageMetadata({
            title: "Страница не найдена | 310FPS Custom Lab",
            description: "Такой подборки нет.",
            path: `/gaming-pc/${resolution}`,
            noIndex: true,
        });
    }

    return createPageMetadata({
        title: page.title,
        description: page.description,
        path: `/gaming-pc/${page.slug}`,
    });
}

export default async function GamingPcLandingPage({ params }: PageProps) {
    const { resolution } = await params;
    const page = getGamingPcLandingBySlug(resolution);

    if (!page) notFound();

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    };

    const breadcrumbsJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Игровые ПК", item: absoluteUrl("/gaming-pc") },
            {
                "@type": "ListItem",
                position: 3,
                name: page.shortTitle,
                item: absoluteUrl(`/gaming-pc/${page.slug}`),
            },
        ],
    };

    return (
        <>
            {page.faq.length > 0 && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
            />
            <GamingPcContent page={page} />
        </>
    );
}
