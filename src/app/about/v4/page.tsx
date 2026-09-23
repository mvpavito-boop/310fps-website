import { AboutV4Page } from "@/components/about/v4/AboutV4Page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "О лаборатории — новая версия | 310FPS Custom Lab",
    description:
        "История 310FPS Custom Lab: персональная ответственность за каждую сборку, 24-часовой стресс-тест, паспорт ПК и поддержка после выдачи.",
    path: "/about/v4",
    noIndex: true,
});

export default function AboutV4Route() {
    return <AboutV4Page />;
}
