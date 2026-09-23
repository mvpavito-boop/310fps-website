import { AboutV5Page } from "@/components/about/v5/AboutV5Page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "О лаборатории — концепция V5 | 310FPS Custom Lab",
    description:
        "310FPS Custom Lab: основатель, история лаборатории, инженерный процесс, принципы качества и реальные отзывы клиентов.",
    path: "/about/v5",
    noIndex: true,
});

export default function AboutV5Route() {
    return <AboutV5Page />;
}
