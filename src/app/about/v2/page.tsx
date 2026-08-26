import { AboutV2Page } from "@/components/about/v2/AboutV2Page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "О лаборатории — 310FPS Custom Lab",
    description:
        "Интерактивная экспозиция 310FPS Custom Lab: один мастер, 2000+ систем, стресс-тест 24 часа и паспорт каждой сборки.",
    path: "/about/v2",
    noIndex: true,
});

export default function AboutV2Route() {
    return <AboutV2Page />;
}
