import { Suspense } from "react";
import { ConfiguratorContent } from "@/components/configurator-lab/ConfiguratorContent";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Конфигуратор ПК | 310FPS Custom Lab",
    description:
        "Соберите игровой ПК по комплектующим: совместимость, запас блока питания и оценка FPS считаются на лету. Цена в конфигураторе — чековая стоимость полной сборки.",
    path: "/configurator",
});

export default function ConfiguratorPage() {
    return (
        /* useSearchParams требует границы Suspense, иначе страница целиком
           уходит в динамический рендер. */
        <Suspense fallback={<div className="min-h-screen" />}>
            <ConfiguratorContent />
        </Suspense>
    );
}
