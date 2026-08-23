import { SeriesIndexContent } from "@/components/series/SeriesIndexContent";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Линейки Lab Series | 310FPS Custom Lab",
    description:
        "Пять линеек игровых ПК: SIGNAL — честный старт, VECTOR — киберспорт, CANVAS — 4K и работа, SPECTRE — тишина, AXIOM — флагман. От 130 000 ₽.",
    path: "/series",
});

export default function SeriesIndexPage() {
    return <SeriesIndexContent />;
}
