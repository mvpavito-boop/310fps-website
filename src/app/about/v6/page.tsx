import { AboutV6Page } from "@/components/about/v6/AboutV6Page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Люди за каждым ПК — 310FPS Custom Lab",
    description: "История 310FPS, основатель Павел Иванов, работа лаборатории и люди, которые возвращаются за следующим компьютером.",
    path: "/about/v6",
    noIndex: true,
});

export default function AboutV6Route() {
    return <AboutV6Page />;
}
