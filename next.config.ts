import type { NextConfig } from "next";

/* Карта URL изменилась при редизайне: /lineup и /series описывали одно и то же,
   а статьи отдавались сразу по двум адресам (/guides и /media/articles), что
   создавало дубли для поисковиков. Старые адреса переезжают постоянным
   редиректом, чтобы не терять уже собранные ссылки. */
const legacyRedirects = [
    { source: "/lineup", destination: "/series", permanent: true },
    { source: "/lineup/:id", destination: "/series/:id", permanent: true },
    { source: "/guides", destination: "/blog", permanent: true },
    { source: "/guides/:slug", destination: "/blog/:slug", permanent: true },
    { source: "/media", destination: "/blog", permanent: true },
    { source: "/media/articles", destination: "/blog", permanent: true },
    { source: "/media/articles/:slug", destination: "/blog/:slug", permanent: true },
    { source: "/media/news", destination: "/blog", permanent: true },
    /* Служебные страницы вариантов дизайна удалены вместе с редизайном */
    { source: "/typography/:path*", destination: "/", permanent: true },
    { source: "/hero-variants", destination: "/", permanent: true },
    { source: "/catalog/card-ab", destination: "/catalog", permanent: true },
    { source: "/catalog/design-variants", destination: "/catalog", permanent: true },
    { source: "/banners", destination: "/", permanent: true },
];

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "eooenprtybhyamaeydkz.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    async redirects() {
        return legacyRedirects;
    },
};

export default nextConfig;
