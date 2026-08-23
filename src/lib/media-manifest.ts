export type LineupSlug = "signal" | "vector" | "canvas" | "spectre" | "axiom";
export type CatalogLine = "VECTOR" | "SIGNAL" | "CANVAS" | "SPECTRE" | "AXIOM";

const FALLBACK_PC_IMAGE = "/media/images/axiom.jpg";

const legacyCatalogImages = {
    gamingPc: "/images/banners/gaming_pc.png",
    gamingGpu: "/images/banners/gaming_gpu.png",
    gamingSetup: "/images/banners/gaming_setup.png",
    cyberAbstract: "/images/banners/cyber_abstract.png",
} as const;

function lineupSlot(slug: LineupSlug) {
    return {
        hero: `/media/images/lineup/${slug}/${slug}-hero.webp`,
        mobile: `/media/images/lineup/${slug}/${slug}-mobile.webp`,
        detail: `/media/images/lineup/${slug}/${slug}-detail.webp`,
        gallery: [
            `/media/images/lineup/${slug}/${slug}-gallery-01.webp`,
            `/media/images/lineup/${slug}/${slug}-gallery-02.webp`,
            `/media/images/lineup/${slug}/${slug}-gallery-03.webp`,
        ],
    } as const;
}

function catalogSlot(line: Lowercase<CatalogLine>) {
    return {
        lineHero: `/media/images/catalog/${line}/${line}-hero.webp`,
        fallbackMain: `/media/images/catalog/${line}/${line}-main.webp`,
        galleryPattern: `/media/images/catalog/${line}/{model-id}-{01..06}.webp`,
    } as const;
}

function guideSlot(slug: string) {
    return {
        cover: `/media/images/editorial/guides/${slug}-cover.webp`,
        hero: `/media/images/editorial/guides/${slug}-hero.webp`,
        inline: `/media/images/editorial/guides/${slug}-inline-01.webp`,
    } as const;
}

function articleSlot(slug: string) {
    return {
        cover: `/media/images/editorial/articles/${slug}-cover.webp`,
        hero: `/media/images/editorial/articles/${slug}-hero.webp`,
        inline: `/media/images/editorial/articles/${slug}-inline-01.webp`,
    } as const;
}

function newsSlot(slug: string) {
    return {
        cover: `/media/images/editorial/news/${slug}-cover.webp`,
        hero: `/media/images/editorial/news/${slug}-hero.webp`,
    } as const;
}

export const MEDIA_MANIFEST = {
    fallbacks: {
        pc: FALLBACK_PC_IMAGE,
    },
    editorial: {
        homeHero: {
            active: FALLBACK_PC_IMAGE,
            slots: {
                desktop: "/media/images/editorial/home-hero-desktop.webp",
                mobile: "/media/images/editorial/home-hero-mobile.webp",
                og: "/media/images/editorial/home-hero-og.webp",
            },
        },
        labDesk: {
            active: FALLBACK_PC_IMAGE,
            slots: {
                wide: "/media/images/editorial/lab-desk-wide.webp",
                mobile: "/media/images/editorial/lab-desk-mobile.webp",
            },
        },
        passport: {
            active: "/media/images/bento_warranty.png",
            slots: {
                desktop: "/media/images/editorial/passport-pc.webp",
                detail: "/media/images/editorial/passport-detail.webp",
            },
        },
        stressTest: {
            active: "/media/images/why-us/why-us-stress-test.webp",
            slots: {
                desktop: "/media/images/editorial/stress-test.webp",
            },
        },
        guides: {
            fallback: FALLBACK_PC_IMAGE,
            bySlug: {
                "kak-vybrat-igrovoj-pk-full-hd-2k-4k": {
                    active: FALLBACK_PC_IMAGE,
                    slots: guideSlot("kak-vybrat-igrovoj-pk-full-hd-2k-4k"),
                },
                "gotovyj-igrovoj-pk-ili-konfigurator": {
                    active: FALLBACK_PC_IMAGE,
                    slots: guideSlot("gotovyj-igrovoj-pk-ili-konfigurator"),
                },
                "ddr4-ili-ddr5-dlya-igrovogo-pk": {
                    active: FALLBACK_PC_IMAGE,
                    slots: guideSlot("ddr4-ili-ddr5-dlya-igrovogo-pk"),
                },
                "kakoj-blok-pitaniya-nuzhen-igrovomu-pk": {
                    active: FALLBACK_PC_IMAGE,
                    slots: guideSlot("kakoj-blok-pitaniya-nuzhen-igrovomu-pk"),
                },
                "ohlazhdenie-igrovogo-pk-vozduh-ili-szho": {
                    active: FALLBACK_PC_IMAGE,
                    slots: guideSlot("ohlazhdenie-igrovogo-pk-vozduh-ili-szho"),
                },
                "zachem-nuzhen-stress-test-i-pasport-pk": {
                    active: "/media/images/bento_warranty.png",
                    slots: guideSlot("zachem-nuzhen-stress-test-i-pasport-pk"),
                },
                "kakuyu-videokartu-vybrat-dlya-igrovogo-pk": {
                    active: FALLBACK_PC_IMAGE,
                    slots: guideSlot("kakuyu-videokartu-vybrat-dlya-igrovogo-pk"),
                },
                "apgrejd-ili-novyj-igrovoj-pk": {
                    active: FALLBACK_PC_IMAGE,
                    slots: guideSlot("apgrejd-ili-novyj-igrovoj-pk"),
                },
            },
        },
        articles: {
            fallback: FALLBACK_PC_IMAGE,
            bySlug: {
                "kak-vybrat-igrovoj-pk-full-hd-2k-4k": {
                    active: FALLBACK_PC_IMAGE,
                    slots: articleSlot("kak-vybrat-igrovoj-pk-full-hd-2k-4k"),
                },
                "gotovyj-igrovoj-pk-ili-konfigurator": {
                    active: FALLBACK_PC_IMAGE,
                    slots: articleSlot("gotovyj-igrovoj-pk-ili-konfigurator"),
                },
                "ddr4-ili-ddr5-dlya-igrovogo-pk": {
                    active: FALLBACK_PC_IMAGE,
                    slots: articleSlot("ddr4-ili-ddr5-dlya-igrovogo-pk"),
                },
                "kakoj-blok-pitaniya-nuzhen-igrovomu-pk": {
                    active: FALLBACK_PC_IMAGE,
                    slots: articleSlot("kakoj-blok-pitaniya-nuzhen-igrovomu-pk"),
                },
                "ohlazhdenie-igrovogo-pk-vozduh-ili-szho": {
                    active: FALLBACK_PC_IMAGE,
                    slots: articleSlot("ohlazhdenie-igrovogo-pk-vozduh-ili-szho"),
                },
                "zachem-nuzhen-stress-test-i-pasport-pk": {
                    active: "/media/images/bento_warranty.png",
                    slots: articleSlot("zachem-nuzhen-stress-test-i-pasport-pk"),
                },
                "kakuyu-videokartu-vybrat-dlya-igrovogo-pk": {
                    active: FALLBACK_PC_IMAGE,
                    slots: articleSlot("kakuyu-videokartu-vybrat-dlya-igrovogo-pk"),
                },
                "apgrejd-ili-novyj-igrovoj-pk": {
                    active: FALLBACK_PC_IMAGE,
                    slots: articleSlot("apgrejd-ili-novyj-igrovoj-pk"),
                },
            },
        },
        news: {
            fallback: FALLBACK_PC_IMAGE,
            bySlug: {
                "media-310fps-social-feed": {
                    active: FALLBACK_PC_IMAGE,
                    slots: newsSlot("media-310fps-social-feed"),
                },
                "catalog-scenarios-budget-update": {
                    active: legacyCatalogImages.gamingPc,
                    slots: newsSlot("catalog-scenarios-budget-update"),
                },
                "pc-passport-before-delivery": {
                    active: "/media/images/bento_warranty.png",
                    slots: newsSlot("pc-passport-before-delivery"),
                },
                "gpu-choice-principles-2026": {
                    active: legacyCatalogImages.gamingGpu,
                    slots: newsSlot("gpu-choice-principles-2026"),
                },
                "streaming-and-gaming-one-pc": {
                    active: legacyCatalogImages.cyberAbstract,
                    slots: newsSlot("streaming-and-gaming-one-pc"),
                },
                "quiet-4k-builds": {
                    active: FALLBACK_PC_IMAGE,
                    slots: newsSlot("quiet-4k-builds"),
                },
            },
        },
    },
    whyUs: {
        cableManagement: "/media/images/why-us/why-us-cable-management.webp",
        stressTest: "/media/images/why-us/why-us-stress-test.webp",
        transparentEstimate: "/media/images/why-us/why-us-transparent-estimate.webp",
        upgradeWarranty: "/media/images/why-us/why-us-upgrade-warranty.webp",
    },
    lineup: {
        signal: {
            active: { hero: FALLBACK_PC_IMAGE, gallery: [FALLBACK_PC_IMAGE] },
            slots: lineupSlot("signal"),
        },
        vector: {
            active: { hero: FALLBACK_PC_IMAGE, gallery: [FALLBACK_PC_IMAGE] },
            slots: lineupSlot("vector"),
        },
        canvas: {
            active: { hero: FALLBACK_PC_IMAGE, gallery: [FALLBACK_PC_IMAGE] },
            slots: lineupSlot("canvas"),
        },
        spectre: {
            active: { hero: FALLBACK_PC_IMAGE, gallery: [FALLBACK_PC_IMAGE] },
            slots: lineupSlot("spectre"),
        },
        axiom: {
            active: { hero: FALLBACK_PC_IMAGE, gallery: [FALLBACK_PC_IMAGE] },
            slots: lineupSlot("axiom"),
        },
    },
    catalog: {
        VECTOR: {
            activeImages: [FALLBACK_PC_IMAGE, legacyCatalogImages.gamingPc, legacyCatalogImages.gamingSetup],
            slots: catalogSlot("vector"),
        },
        SIGNAL: {
            activeImages: [legacyCatalogImages.gamingPc, legacyCatalogImages.gamingGpu, FALLBACK_PC_IMAGE],
            slots: catalogSlot("signal"),
        },
        CANVAS: {
            activeImages: [legacyCatalogImages.gamingSetup, FALLBACK_PC_IMAGE, legacyCatalogImages.cyberAbstract],
            slots: catalogSlot("canvas"),
        },
        SPECTRE: {
            activeImages: [legacyCatalogImages.gamingGpu, legacyCatalogImages.cyberAbstract, FALLBACK_PC_IMAGE],
            slots: catalogSlot("spectre"),
        },
        AXIOM: {
            activeImages: [FALLBACK_PC_IMAGE, legacyCatalogImages.gamingSetup, legacyCatalogImages.gamingPc],
            slots: catalogSlot("axiom"),
        },
    },
} as const;

export const MEDIA_FALLBACKS = MEDIA_MANIFEST.fallbacks;

export const EDITORIAL_MEDIA = {
    homeHero: MEDIA_MANIFEST.editorial.homeHero.active,
    labDesk: MEDIA_MANIFEST.editorial.labDesk.active,
    passport: MEDIA_MANIFEST.editorial.passport.active,
    stressTest: MEDIA_MANIFEST.editorial.stressTest.active,
} as const;

export const GUIDE_MEDIA = MEDIA_MANIFEST.editorial.guides;
export const ARTICLE_MEDIA = MEDIA_MANIFEST.editorial.articles;
export const NEWS_MEDIA = MEDIA_MANIFEST.editorial.news;

export function getGuideImage(slug: string) {
    return GUIDE_MEDIA.bySlug[slug as keyof typeof GUIDE_MEDIA.bySlug]?.active || GUIDE_MEDIA.fallback;
}

export function getArticleImage(slug: string) {
    return ARTICLE_MEDIA.bySlug[slug as keyof typeof ARTICLE_MEDIA.bySlug]?.active || ARTICLE_MEDIA.fallback;
}

export function getNewsImage(slug: string) {
    return NEWS_MEDIA.bySlug[slug as keyof typeof NEWS_MEDIA.bySlug]?.active || NEWS_MEDIA.fallback;
}

export const WHY_US_MEDIA = MEDIA_MANIFEST.whyUs;

export const LINEUP_MEDIA: Record<LineupSlug, { hero: string; gallery: string[] }> = {
    signal: {
        hero: MEDIA_MANIFEST.lineup.signal.active.hero,
        gallery: [...MEDIA_MANIFEST.lineup.signal.active.gallery],
    },
    vector: {
        hero: MEDIA_MANIFEST.lineup.vector.active.hero,
        gallery: [...MEDIA_MANIFEST.lineup.vector.active.gallery],
    },
    canvas: {
        hero: MEDIA_MANIFEST.lineup.canvas.active.hero,
        gallery: [...MEDIA_MANIFEST.lineup.canvas.active.gallery],
    },
    spectre: {
        hero: MEDIA_MANIFEST.lineup.spectre.active.hero,
        gallery: [...MEDIA_MANIFEST.lineup.spectre.active.gallery],
    },
    axiom: {
        hero: MEDIA_MANIFEST.lineup.axiom.active.hero,
        gallery: [...MEDIA_MANIFEST.lineup.axiom.active.gallery],
    },
};

export const CATALOG_LINE_MEDIA: Record<CatalogLine, string[]> = {
    VECTOR: [...MEDIA_MANIFEST.catalog.VECTOR.activeImages],
    SIGNAL: [...MEDIA_MANIFEST.catalog.SIGNAL.activeImages],
    CANVAS: [...MEDIA_MANIFEST.catalog.CANVAS.activeImages],
    SPECTRE: [...MEDIA_MANIFEST.catalog.SPECTRE.activeImages],
    AXIOM: [...MEDIA_MANIFEST.catalog.AXIOM.activeImages],
};
