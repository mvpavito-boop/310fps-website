import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/blog/ArticleContent";
import { getAllGuideSlugs, getGuideBySlug } from "@/lib/data/guides";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/site-config";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const guide = getGuideBySlug(slug);

    if (!guide) {
        return createPageMetadata({
            title: "Статья не найдена | 310FPS Custom Lab",
            description: "Такой статьи нет в журнале.",
            path: `/blog/${slug}`,
            noIndex: true,
        });
    }

    return createPageMetadata({
        title: `${guide.title} | 310FPS Custom Lab`,
        description: guide.description,
        path: `/blog/${guide.slug}`,
    });
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const guide = getGuideBySlug(slug);

    if (!guide) notFound();

    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        url: absoluteUrl(`/blog/${guide.slug}`),
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        inLanguage: "ru-RU",
        author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo-full.png") },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${guide.slug}`) },
    };

    const breadcrumbsJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Журнал", item: absoluteUrl("/blog") },
            { "@type": "ListItem", position: 3, name: guide.title, item: absoluteUrl(`/blog/${guide.slug}`) },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
            />
            <ArticleContent guide={guide} />
        </>
    );
}
