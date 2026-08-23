import { MetadataRoute } from "next";
import { getAllCatalogPcIds } from "@/lib/data/catalog";
import { getAllGuides } from "@/lib/data/guides";
import { getAllGamingPcLandings } from "@/lib/data/gaming-pc-pages";
import { getAllSeriesSlugs } from "@/lib/data/lab-series";
import { absoluteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const catalogEntries: MetadataRoute.Sitemap = getAllCatalogPcIds().map((id) => ({
        url: absoluteUrl(`/catalog/${id}`),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    const seriesEntries: MetadataRoute.Sitemap = getAllSeriesSlugs().map((slug) => ({
        url: absoluteUrl(`/series/${slug}`),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.84,
    }));

    const gamingPcEntries: MetadataRoute.Sitemap = getAllGamingPcLandings().map((page) => ({
        url: absoluteUrl(`/gaming-pc/${page.slug}`),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.82,
    }));

    const blogEntries: MetadataRoute.Sitemap = getAllGuides().map((guide) => ({
        url: absoluteUrl(`/blog/${guide.slug}`),
        lastModified: new Date(guide.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.65,
    }));

    return [
        { url: absoluteUrl(), lastModified: now, changeFrequency: "weekly", priority: 1 },
        { url: absoluteUrl("/catalog"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: absoluteUrl("/configurator"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: absoluteUrl("/gaming-pc"), lastModified: now, changeFrequency: "weekly", priority: 0.88 },
        ...gamingPcEntries,
        { url: absoluteUrl("/series"), lastModified: now, changeFrequency: "weekly", priority: 0.86 },
        ...seriesEntries,
        ...catalogEntries,
        { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.75 },
        ...blogEntries,
        { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: absoluteUrl("/contacts"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        { url: absoluteUrl("/delivery"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: absoluteUrl("/warranty"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: absoluteUrl("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ];
}
