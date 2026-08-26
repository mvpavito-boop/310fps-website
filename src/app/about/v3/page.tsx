import { AboutV3Page } from "@/components/about/v3/AboutV3Page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "О лаборатории — 310FPS Custom Lab",
    description:
        "310FPS Custom Lab — сборка игровых ПК на заказ в Санкт-Петербурге. Один мастер, 2000+ систем, стресс-тест 24 часа и паспорт каждой сборки.",
    path: "/about/v3",
    noIndex: true,
});

export default function AboutV3Route() {
    return <AboutV3Page />;
}
