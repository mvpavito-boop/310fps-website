export const campaignSlugs = ["custom", "workstation", "compact", "upgrade", "compare"] as const;

export type CampaignSlug = (typeof campaignSlugs)[number];

export function isCampaignSlug(value: string): value is CampaignSlug {
    return campaignSlugs.some((slug) => slug === value);
}

export function getOrderHref(pathname: string) {
    const slug = pathname.slice("/campaign/".length);
    return pathname.startsWith("/campaign/") && isCampaignSlug(slug) ? "#campaign-form" : "/#cta";
}
