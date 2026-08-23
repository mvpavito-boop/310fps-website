"use client";

import { useEffect } from "react";

type TypographyVariantBridgeProps = {
    variant: "april" | "current" | "hybrid";
};

const HYBRID_STYLE_ID = "typography-hybrid-overrides";

const HYBRID_CSS = `
html[data-typography-variant="hybrid"] header nav,
html[data-typography-variant="hybrid"] header nav a,
html[data-typography-variant="hybrid"] main section:first-of-type h1 + p,
html[data-typography-variant="hybrid"] main section:first-of-type .font-mono,
html[data-typography-variant="hybrid"] .typography-hybrid .editorial-kicker,
html[data-typography-variant="hybrid"] .typography-hybrid a[class*="tracking-wider"]:not([data-analytics-goal="home_hero_catalog_click"]):not([data-analytics-goal="home_hero_telegram_click"]),
html[data-typography-variant="hybrid"] .typography-hybrid a[class*="tracking-widest"]:not([data-analytics-goal="home_hero_catalog_click"]):not([data-analytics-goal="home_hero_telegram_click"]),
html[data-typography-variant="hybrid"] .typography-hybrid button[class*="tracking-wider"],
html[data-typography-variant="hybrid"] .typography-hybrid button[class*="tracking-widest"] {
    font-family: var(--font-tektur), system-ui, -apple-system, sans-serif !important;
}

html[data-typography-variant="hybrid"] .typography-hybrid [data-analytics-goal="home_hero_catalog_click"],
html[data-typography-variant="hybrid"] .typography-hybrid [data-analytics-goal="home_hero_telegram_click"] {
    font-family: var(--font-heading) !important;
}
`;

export function TypographyVariantBridge({ variant }: TypographyVariantBridgeProps) {
    useEffect(() => {
        document.documentElement.dataset.typographyVariant = variant;

        if (variant === "hybrid" && !document.getElementById(HYBRID_STYLE_ID)) {
            const style = document.createElement("style");
            style.id = HYBRID_STYLE_ID;
            style.textContent = HYBRID_CSS;
            document.head.appendChild(style);
        }

        return () => {
            delete document.documentElement.dataset.typographyVariant;
            document.getElementById(HYBRID_STYLE_ID)?.remove();
        };
    }, [variant]);

    return null;
}
