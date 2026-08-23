import { BlogIndexContent } from "@/components/blog/BlogIndexContent";
import { getAllGuides } from "@/lib/data/guides";
import { absoluteUrl, createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Журнал | 310FPS Custom Lab",
    description:
        "Разборы без маркетинга: как выбрать игровой ПК под разрешение, чем отличается DDR4 от DDR5, какой нужен блок питания и зачем стресс-тест перед выдачей.",
    path: "/blog",
});

const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Журнал 310FPS Custom Lab",
    url: absoluteUrl("/blog"),
    inLanguage: "ru-RU",
    blogPost: getAllGuides().map((guide) => ({
        "@type": "BlogPosting",
        headline: guide.title,
        url: absoluteUrl(`/blog/${guide.slug}`),
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
    })),
};

export default function BlogPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
            <BlogIndexContent />
        </>
    );
}
