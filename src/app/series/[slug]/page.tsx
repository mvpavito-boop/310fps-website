import { notFound } from "next/navigation";
import { SeriesPageContent } from "@/components/series/SeriesPageContent";
import { getAllSeriesSlugs, getSeriesPageBySlug } from "@/lib/data/lab-series";
import { absoluteUrl, createPageMetadata } from "@/lib/site-config";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return getAllSeriesSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const page = getSeriesPageBySlug(slug);

    if (!page) {
        return createPageMetadata({
            title: "Линейка не найдена | 310FPS Custom Lab",
            description: "Такой линейки нет.",
            path: `/series/${slug}`,
            noIndex: true,
        });
    }

    return createPageMetadata({
        title: page.metaTitle,
        description: page.metaDescription,
        path: `/series/${page.slug}`,
        image: page.builds[0].image,
        imageAlt: `Линейка ${page.lineup.title}`,
    });
}

export default async function SeriesPage({ params }: PageProps) {
    const { slug } = await params;
    const page = getSeriesPageBySlug(slug);

    if (!page) notFound();

    const breadcrumbsJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Линейки", item: absoluteUrl("/series") },
            {
                "@type": "ListItem",
                position: 3,
                name: page.lineup.title,
                item: absoluteUrl(`/series/${page.slug}`),
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
            />
            <SeriesPageContent page={page} />
        </>
    );
}
